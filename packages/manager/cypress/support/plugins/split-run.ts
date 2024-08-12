/**
 * @file Allows parallelization without Cypress Cloud.
 */

import { globSync } from 'glob';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { SpecWeight, SpecWeights, specWeightsSchema } from './generate-weights';
import type { CypressPlugin } from './plugin';

export const splitCypressRun: CypressPlugin = (_on, config) => {
  const {
    CY_TEST_SPLIT_RUN: splitRunEnabled,
    CY_TEST_SPLIT_RUN_TOTAL: splitRunTotalRunners,
    CY_TEST_SPLIT_RUN_INDEX: splitRunRunnerIndex,
    CY_TEST_SPLIT_RUN_WEIGHTS: splitRunWeightsPath,
  } = config.env;

  // Short-circuit if split running is not enabled.
  // In this case, return an unmodified config object.
  if (!splitRunEnabled) {
    return config;
  }

  // If split running is enabled, total and index must be defined.
  // Otherwise, we'll throw an error that will be displayed to the user.
  if (!splitRunTotalRunners || !splitRunRunnerIndex) {
    throw new Error(
      'CY_TEST_SPLIT_RUN is enabled, but CY_TEST_SPLIT_RUN_TOTAL and CY_TEST_SPLIT_RUN_INDEX are not defined.'
    );
  }
  if (isNaN(splitRunTotalRunners) || isNaN(splitRunRunnerIndex)) {
    throw new Error(
      'CY_TEST_SPLIT_RUN_TOTAL and CY_TEST_SPLIT_RUN_INDEX must be numeric.'
    );
  }

  const totalRunners = parseInt(splitRunTotalRunners, 10);
  const runner = parseInt(splitRunRunnerIndex, 10);

  // Override configuration spec pattern to reflect test subset for this runner...
  const specs = globSync(config.specPattern);

  // Information about test weights to be included in the info table, if applicable.
  // TODO type.
  let weightsInfo: Record<string, any> = {
    'Test Weights': '(Unavailable)',
  };

  let weighedSpecs: SpecWeight[] = [];
  let unweighedSpecs: string[] = [...specs];

  // Read spec weights file, if it's available, and identify weighed and unweighed specs.
  if (splitRunWeightsPath) {
    try {
      const weightsContents = readFileSync(
        resolve(splitRunWeightsPath),
        'utf-8'
      );
      const weightsData = JSON.parse(weightsContents) as SpecWeights;
      specWeightsSchema.validateSync(weightsData);
      const specWeights = weightsData.weights.sort(
        (a, b) => b.weight - a.weight
      );

      // Get an array of `SpecWeight`s for each actual spec that has a corresponding weight entry.
      weighedSpecs = specs
        .map((specPath: string): SpecWeight | undefined => {
          return specWeights.find(
            (specWeight) => specWeight.filepath === specPath
          );
        })
        .filter((specWeight): specWeight is SpecWeight => !!specWeight);

      // Get an array of relative paths to specs that do not have weight data available.
      unweighedSpecs = specs.filter((specPath: string) => {
        return !specWeights.find(
          (specWeight) => specWeight.filepath === specPath
        );
      });

      // Reassign the weights info object to later output to the console.
      weightsInfo = {
        'Test Weights': splitRunWeightsPath,
        'Total Test Weight': weightsData.meta.totalWeight,
        'Runner Test Weight': 0,
        'Weighed Specs': weighedSpecs.length,
        'Unweighed Specs': unweighedSpecs.length,
      };
    } catch (err) {
      // Swallow error here; it's OK if test weights file doesn't exist / can't be read.
      // Wrap messages in IIFEs to avoid issue where info messages get printed first.
      (() => {
        console.warn(`Failed to read weights file at '${splitRunWeightsPath}'`);
        if ('message' in err) {
          console.warn(`Error message: ${err.message}`);
        }
      })();
      (() => {
        console.info(
          'You can optimize your CI run performance by generating a valid weights file'
        );
        console.info(
          `Example: CY_TEST_GENWEIGHTS='${splitRunWeightsPath}' yarn cy:run`
        );
      })();
    }
  }

  // Create an array containing objects to track specs and weight for each runner.
  const weightSimulationResults: {
    specs: string[];
    weight: number;
  }[] = Array.from({ length: totalRunners }, () => ({
    specs: [],
    weight: 0,
  }));

  weighedSpecs.forEach((weighedSpec) => {
    // Ensure lowest weighed runner is at index 0.
    weightSimulationResults.sort((a, b) => a.weight - b.weight);
    weightSimulationResults[0].specs.push(weighedSpec.filepath);
    weightSimulationResults[0].weight += weighedSpec.weight;
  });

  // Calculate this runner's total test weight.
  // Wrapped in an if to prevent this from appearing when weights are unavailable.
  if (weightSimulationResults[splitRunRunnerIndex - 1]?.weight) {
    const weight =
      Math.round(
        weightSimulationResults[splitRunRunnerIndex - 1].weight * 100
      ) / 100;
    weightsInfo['Runner Test Weight'] = `${weight}%`;
  }

  // Distribute remaining unweighed specs, if applicable.
  // Sort spec filenames as deterministically as we easily can.
  unweighedSpecs.sort((a: string, b: string): number => {
    if (a.toLowerCase() < b.toLowerCase()) {
      return -1;
    } else if (a.toLowerCase() > b.toLowerCase()) {
      return 1;
    }
    return 0;
  });

  config.specPattern = [
    // Only include the weighed specs at index N, where N is this runner's index - 1.
    ...weightSimulationResults[splitRunRunnerIndex - 1].specs,

    // Only include every Nth spec, where N is the total number of runners.
    ...unweighedSpecs.filter((_spec: string, index: number) => {
      return (index + runner - 1) % totalRunners === 0;
    }),
  ];

  console.info('Cypress split running is enabled.');
  console.table({
    '# of Specs Total': specs.length,
    '# of Specs for This Run': config.specPattern.length,
    Runner: runner,
    'Total Runners': totalRunners,
    ...weightsInfo,
  });

  return config;
};

/**
 * @file Allows parallelization without Cypress Cloud.
 */

import { globSync } from 'glob';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { SpecWeight, SpecWeights, specWeightsSchema } from './generate-weights';
import type { CypressPlugin } from './plugin';

/**
 * Describes weighted specs for a single test runner.
 */
interface WeightedRunnerSpecs {
  /** Array of spec filepaths for runner. */
  specs: string[];

  /** Total test weight of specs in `specs`. */
  weight: number;
}

/**
 * Divides a run between separate Cypress processes.
 *
 * Optionally, a test weights file may be specified to optimize test distribution
 * among runners.
 */
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

  let totalWeight = 0;
  let weightedSpecs: SpecWeight[] = [];
  let unweightedSpecs: string[] = [...specs];

  // If spec weights file path is specified, attempt to read its contents.
  // If weights file does not exist, is inaccessible, or is malformed, weights
  // data will be discarded and run splitting will fall back on round-robin
  // distribution method.
  if (splitRunWeightsPath) {
    try {
      const specWeights = readTestWeightsFile(splitRunWeightsPath);
      weightedSpecs = getWeightedSpecs(specs, specWeights);
      unweightedSpecs = getUnweightedSpecs(specs, specWeights);
      totalWeight = specWeights.meta.totalWeight;
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
          `Example: CY_TEST_GENWEIGHTS='${splitRunWeightsPath}' pnpm cy:run`
        );
      })();
    }
  }

  // Distribute specs based on their weights and get an array of weighted specs
  // for this runner.
  const weightedSpecsForRunner = getWeightedRunnerSpecs(
    runner,
    totalRunners,
    weightedSpecs
  );

  // Distribute remaining unweighted specs round-robin style, if applicable.
  // Sort spec filenames as deterministically as we easily can.
  unweightedSpecs.sort((a: string, b: string): number => {
    if (a.toLowerCase() < b.toLowerCase()) {
      return -1;
    } else if (a.toLowerCase() > b.toLowerCase()) {
      return 1;
    }
    return 0;
  });

  config.specPattern = [
    // Include weighted specs first.
    ...weightedSpecsForRunner.specs,

    // If there are any unweighted specs remaining, only include every Nth
    // spec, where N is the total number of runners.
    ...unweightedSpecs.filter((_spec: string, index: number) => {
      return (index + runner - 1) % totalRunners === 0;
    }),
  ];

  const splitRunInfo = {
    '# of Specs Total': specs.length,
    '# of Specs for This Run': config.specPattern.length,
    Runner: runner,
    'Total Runners': totalRunners,
  };

  const weightsInfo = (() => {
    if (weightedSpecs.length < 1) {
      return {
        'Test Weights': 'Unavailable',
      };
    }
    return {
      'Test Weights': splitRunWeightsPath,
      'Total Test Weight': `${Math.round(totalWeight * 100) / 100}%`,
      'Runner Test Weight': `${
        Math.round(weightedSpecsForRunner.weight * 100) / 100
      }%`,
      'Weighted Specs': weightedSpecs.length,
      'Unweighted Specs': unweightedSpecs.length,
    };
  })();

  console.info('Cypress split running is enabled.');
  console.table({
    ...splitRunInfo,
    ...weightsInfo,
  });

  return config;
};

/**
 * Reads a test weights file at the given path and returns its data.
 *
 * Weights data is sorted from highest to lowest weight.
 *
 * @param weightsFilepath - Path to weights file.
 *
 * @throws If `weightsFilepath` does not exist or is not readable.
 * @throws If weights data is invalid.
 *
 * @returns Spec weights data.
 */
const readTestWeightsFile = (weightsFilepath: string): SpecWeights => {
  const weightsContents = readFileSync(resolve(weightsFilepath), 'utf-8');
  const weightsData = JSON.parse(weightsContents) as SpecWeights;
  specWeightsSchema.validateSync(weightsData);

  // Sort spec weights from highest weight to lowest.
  weightsData.weights.sort((a, b) => b.weight - a.weight);

  return weightsData;
};

/**
 * Returns an array of `SpecWeight` objects for each spec file with corresponding weight data.
 *
 * @param allSpecs - String of spec filepaths for this run.
 * @param specWeights - Spec weights data.
 *
 * @returns Array of `SpecWeight` objects for each spec file that has weight data.
 */
const getWeightedSpecs = (
  allSpecs: string[],
  specWeights: SpecWeights
): SpecWeight[] => {
  return allSpecs
    .map((specPath: string): SpecWeight | undefined => {
      return specWeights.weights.find(
        (specWeight) => specWeight.filepath === specPath
      );
    })
    .filter((specWeight): specWeight is SpecWeight => !!specWeight);
};

/**
 * Returns an array of spec filepaths for each spec file that does not have weight data.
 *
 * @param allSpecs - String of spec filepaths for this run.
 * @param specWeights - Spec weights data.
 *
 * @returns Array of spec filepaths for each spec file that does not have corresponding weight data.
 */
const getUnweightedSpecs = (
  allSpecs: string[],
  specWeights: SpecWeights
): string[] => {
  return allSpecs.filter((specPath: string) => {
    return !specWeights.weights.find(
      (specWeight) => specWeight.filepath === specPath
    );
  });
};

/**
 * Returns weighted specs for a single runner in a split run.
 *
 * @param runnerIndex - Index of the runner for which to retrieve specs.
 * @param totalRunners - Total number of runners.
 * @param weightedSpecs - Weighted spec data from which to retrieve specs.
 *
 * @returns Weighted specs for runner with index `runnerIndex`.
 */
const getWeightedRunnerSpecs = (
  runnerIndex: number,
  totalRunners: number,
  weightedSpecs: SpecWeight[]
): WeightedRunnerSpecs => {
  const weightSimulationResults: {
    specs: string[];
    weight: number;
  }[] = Array.from({ length: totalRunners }, () => ({
    specs: [],
    weight: 0,
  }));

  weightedSpecs.forEach((weightedSpec) => {
    // Ensure lowest weighed runner is at index 0.
    weightSimulationResults.sort((a, b) => a.weight - b.weight);
    weightSimulationResults[0].specs.push(weightedSpec.filepath);
    weightSimulationResults[0].weight += weightedSpec.weight;
  });

  return weightSimulationResults[runnerIndex - 1];
};

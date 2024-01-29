/**
 * @file Implements naive parallelization without Cypress Cloud.
 */

import { globSync } from 'glob';

import type { CypressPlugin } from './plugin';

export const splitCypressRun: CypressPlugin = (_on, config) => {
  const splitRunEnabled = config?.env?.['CY_TEST_SPLIT_RUN'];
  const splitRunTotalRunners = config?.env?.['CY_TEST_SPLIT_RUN_TOTAL'];
  const splitRunRunnerIndex = config?.env?.['CY_TEST_SPLIT_RUN_INDEX'];

  // If split running is enabled, total and index must be defined.
  if (splitRunEnabled) {
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

    // Override configuration spec pattern to reflect test subset for this runner.
    const specs = globSync(config.specPattern);
    // Sort spec filenames deterministically.
    // Or at least as deterministically as we can in a pinch...
    specs.sort((a: string, b: string): number => {
      if (a.toLowerCase() < b.toLowerCase()) {
        return -1;
      } else if (a.toLowerCase() > b.toLowerCase()) {
        return 1;
      }
      return 0;
    });

    // Only include every Nth spec, where N is the total number of runners.
    config.specPattern = specs.filter((spec: string, index: number) => {
      return (index + runner - 1) % totalRunners === 0;
    });

    console.info('Cypress split running is enabled.');
    console.table({
      '# of Specs Total': specs.length,
      '# of Specs for This Run': config.specPattern.length,
      Runner: runner,
      'Total Runners': totalRunners,
    });
  }
  return config;
};

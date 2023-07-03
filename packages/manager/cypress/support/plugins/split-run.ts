/**
 * @file Implements naive parallelization without Cypress Cloud.
 */

import type { CypressPlugin } from './plugin';

export const splitCypressRun: CypressPlugin = (on, config) => {
  const splitRunEnabled = config?.env?.['CY_SPLIT_RUN'];
  const splitRunTotalRunners = config?.env?.['CY_SPLIT_RUN_TOTAL'];
  const splitRunRunnerIndex = config?.env?.['CY_SPLIT_RUN_INDEX'];

  // If split running is enabled, total and index must be defined.
  if (splitRunEnabled) {
    if (!splitRunTotalRunners || !splitRunRunnerIndex) {
      throw new Error(
        'CY_SPLIT_RUN is enabled, but CY_SPLIT_RUN_TOTAL and CY_SPLIT_RUN_INDEX are not defined.'
      );
    }
    if (isNaN(splitRunTotalRunners) || isNaN(splitRunRunnerIndex)) {
      throw new Error(
        'CY_SPLIT_RUN_TOTAL and CY_SPLIT_RUN_INDEX must be numeric.'
      );
    }

    const totalRunners = parseInt(splitRunTotalRunners, 10);
    const runner = parseInt(splitRunRunnerIndex, 10);
    console.info('Cypress split running is enabled.');
    console.table({
      Runner: runner,
      'Total Runners': totalRunners,
    });

    console.log(config?.specs);
    console.log(config?.spec);
    console.log(config?.specPattern);

    config.specs = [
      {
        // name: string // "config_passing_spec.js"
        // relative: string // "cypress/integration/config_passing_spec.js" or "__all" if clicked all specs button
        // absolute: string // "/Users/janelane/app/cypress/integration/config_passing_spec.js"
        // specFilter?: string // optional spec filter used by the user
        // specType?: CypressSpecType

        name: 'add-oauth-app.spec.ts',
        relative: 'cypress/e2e/core/account/add-oauth-app.spec.ts',
        absolute:
          '/Users/jdamore/Projects/manager/packages/manager/cypress/e2e/core/account/add-oauth-app.spec.ts',
      },
    ];

    config.spec = {
      // name: string // "config_passing_spec.js"
      // relative: string // "cypress/integration/config_passing_spec.js" or "__all" if clicked all specs button
      // absolute: string // "/Users/janelane/app/cypress/integration/config_passing_spec.js"
      // specFilter?: string // optional spec filter used by the user
      // specType?: CypressSpecType

      name: 'add-oauth-app.spec.ts',
      relative: 'cypress/e2e/core/account/add-oauth-app.spec.ts',
      absolute:
        '/Users/jdamore/Projects/manager/packages/manager/cypress/e2e/core/account/add-oauth-app.spec.ts',
    };

    config.specPattern = '';

    on('before:run', (runDetails) => {
      if (runDetails.specs) {
        console.log(runDetails.specs);
        // runDetails.specs.sort((a: Cypress.Spec, b: Cypress.Spec): number => {
        //   return a.name.localeCompare(b.name);
        // });

        // runDetails.specs = runDetails.specs.filter((spec: Cypress.Spec, index: number) => (index + (runner - 1)) % totalRunners === 0);
        // runDetails.parallel = true;
      }
    });

    return config;
  }
};

import type { CypressPlugin } from './plugin';

// The name of the environment variable to read to check if generation is enabled.
const envVarName = 'CY_TEST_GENWEIGHTS';

/**
 * Enables test weight generation when `CY_TEST_GENWEIGHTS` is defined.
 *
 * @returns Cypress configuration object.
 */
export const generateTestWeights: CypressPlugin = (on, config) => {
  if (!!config.env[envVarName]) {
    on('after:spec', (spec, results) => {
      console.log(spec);
      console.log(results);
    });
  }
};

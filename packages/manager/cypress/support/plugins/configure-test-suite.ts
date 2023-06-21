import { CypressPlugin } from './plugin';

// The name of the environment variable to read when checking suite configuration.
const envVarName = 'CY_TEST_SUITE';

/**
 * Overrides the Cypress test suite according to `CY_TEST_SUITE` environment variable.
 *
 * If `CY_TEST_SUITE` is undefined or invalid, the 'core' test suite will be run
 * by default.
 *
 * @returns Cypress configuration object.
 */
export const configureTestSuite: CypressPlugin = (_on, config) => {
  const suiteName = (() => {
    switch (config.env[envVarName]) {
      case 'synthetic':
        return 'synthetic';

      case 'region':
        return 'region';

      case 'core':
      default:
        if (!!config.env[envVarName] && config.env[envVarName] !== 'core') {
          const desiredSuite = config.env[envVarName];
          console.warn(
            `Unknown test suite '${desiredSuite}'. Running 'core' test suite instead.`
          );
        }
        return 'core';
    }
  })();

  config.specPattern = `cypress/e2e/${suiteName}/**/*.spec.{ts,tsx}`;
  return config;
};

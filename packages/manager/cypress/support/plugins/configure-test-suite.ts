import { CypressPlugin } from './plugin';

// The name of the environment variable to read when checking suite configuration.
const envVarName = 'CY_TEST_SUITE';

/**
 * Overrides the Cypress test suite according to `CY_TEST_SUITE` environment variable.
 *
 * If `CY_TEST_SUITE` is undefined or invalid, the 'core' test suite will be run
 * by default.
 *
 * The resolved test suite name can be read by tests and other plugins via
 * `Cypress.env('cypress_test_suite')`.
 *
 * @returns Cypress configuration object.
 */
export const configureTestSuite: CypressPlugin = (_on, config) => {
  const suiteName = (() => {
    switch (config.env[envVarName]) {
      case 'synthetic':
        return 'synthetic';

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

  config.env['cypress_test_suite'] = suiteName;
  return config;
};

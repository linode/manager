import { CypressPlugin } from './plugin';

/**
 * Overrides the Cypress test suite according to `CY_SUITE` environment variable.
 *
 * If `CY_SUITE` is undefined, the 'core' test suite will be run by default.
 *
 * @returns Cypress configuration object.
 */
export const configureTestSuite: CypressPlugin = (_on, config) => {
  const suiteName = (() => {
    switch (config.env['CY_SUITE']) {
      case 'synthetic':
        return 'synthetic';

      case 'region':
        return 'region';

      case 'core':
      default:
        if (!!config.env['CY_SUITE'] && config.env['CY_SUITE'] !== 'core') {
          const desiredSuite = config.env['CY_SUITE'];
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

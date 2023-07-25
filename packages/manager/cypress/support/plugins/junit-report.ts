import { CypressPlugin } from './plugin';

// The name of the environment variable to read when checking report configuration.
const envVarName = 'CY_TEST_JUNIT_REPORT';

/**
 * Enables and configures JUnit reporting when `CY_TEST_JUNIT_REPORT` is defined.
 *
 * @returns Cypress configuration object.
 */
export const enableJunitReport: CypressPlugin = (_on, config) => {
  if (!!config.env[envVarName]) {
    config.reporter = 'junit';
    config.reporterOptions = {
      mochaFile: 'cypress/results/test-results-[hash].xml',
      testsuitesTitle: 'Cloud Manager Cypress Tests',
    };
  }
  return config;
};

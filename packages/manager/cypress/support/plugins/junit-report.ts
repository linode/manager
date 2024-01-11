import { CypressPlugin } from './plugin';

// The name of the environment variable to read when checking report configuration.
const envVarName = 'CY_TEST_JUNIT_REPORT';

const capitalize = (str: string): string => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
};

/**
 * Enables and configures JUnit reporting when `CY_TEST_JUNIT_REPORT` is defined.
 *
 * @returns Cypress configuration object.
 */
export const enableJunitReport: CypressPlugin = (_on, config) => {
  if (!!config.env[envVarName]) {
    const testSuite = config.env['cypress_test_suite'] || 'core';
    const testSuiteName = `${capitalize(testSuite)} Test Suite`;

    // Cypress doesn't know to look for modules in the root `node_modules`
    // directory, so we have to pass a relative path.
    // See also: https://github.com/cypress-io/cypress/issues/6406
    config.reporter = '../../node_modules/mocha-junit-reporter';

    // See also: https://www.npmjs.com/package/mocha-junit-reporter#full-configuration-options
    config.reporterOptions = {
      mochaFile: 'cypress/results/test-results-[hash].xml',
      rootSuiteTitle: 'Cloud Manager Cypress Tests',
      testsuitesTitle: testSuiteName,
      jenkinsMode: false,
    };
  }
  return config;
};

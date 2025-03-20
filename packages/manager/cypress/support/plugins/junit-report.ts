import { CypressPlugin } from './plugin';

// The name of the environment variable to read when checking report configuration.
const envVarName = 'CY_TEST_JUNIT_REPORT';

const capitalize = (str: string): string => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
};

/**
 * Returns a plugin to enable JUnit reporting when `CY_TEST_JUNIT_REPORT` is defined.
 *
 * If no suite name is specified, this function will attempt to determine the
 * suite name using the Cypress configuration object.
 *
 * @param suiteName - Optional suite name in the JUnit output.
 *
 * @returns Cypress configuration object.
 */
export const enableJunitReport = (
  suiteName?: string,
  jenkinsMode: boolean = false
): CypressPlugin => {
  return (_on, config) => {
    if (!!config.env[envVarName]) {
      // Use `suiteName` if it is specified.
      // Otherwise, attempt to determine the test suite name using
      // our Cypress configuration.
      const testSuite = suiteName || config.env['cypress_test_suite'] || 'core';

      const testSuiteName = `${capitalize(testSuite)} Test Suite`;

      // Cypress doesn't know to look for modules in the root `node_modules`
      // directory, so we have to pass a relative path.
      // See also: https://github.com/cypress-io/cypress/issues/6406
      config.reporter = 'node_modules/mocha-junit-reporter';

      // See also: https://www.npmjs.com/package/mocha-junit-reporter#full-configuration-options
      config.reporterOptions = {
        mochaFile: 'cypress/results/test-results-[hash].xml',
        rootSuiteTitle: 'Cloud Manager Cypress Tests',
        testsuitesTitle: testSuiteName,
        jenkinsMode,
        suiteTitleSeparatedBy: jenkinsMode ? '→' : ' ',
      };
    }
    return config;
  };
};

/**
 * Used to get config options for E2E test suite
 * @param suiteName - Optional suite name in the JUnit output.
 * @param jenkinsMode - If test is execute in Jenkins env
 *
 * @returns object.
 */
export const jUnitE2EReportOptions = (
  testSuite?: string,
  jenkinsMode: boolean = false
) => {
  if (testSuite) {
    const testSuiteName = `${capitalize(testSuite)} Test Suite`;
    return {
      mochaFile: 'cypress/results/test-results-[hash].xml',
      rootSuiteTitle: 'Cloud Manager Cypress Tests',
      testsuitesTitle: testSuiteName,
      jenkinsMode,
      suiteTitleSeparatedBy: jenkinsMode ? '→' : ' ',
    };
  } else {
    return {};
  }
};

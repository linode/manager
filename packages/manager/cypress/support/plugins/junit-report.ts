import { CypressPlugin } from './plugin';

// The name of the environment variable to read when checking report configuration.
const envVarName = 'CY_TEST_JUNIT_REPORT';

const capitalize = (str: string): string => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
};

/**
 * @returns Cypress configuration object.
 */
export const enableJunitE2eReport: CypressPlugin = (_on, config) => {
  const testSuiteName = 'core';
  return getCommonJunitConfig(testSuiteName, config);
};

/**
 * @returns Cypress configuration object.
 */
export const enableJunitComponentReport: CypressPlugin = (_on, config) => {
  const testSuiteName = 'component';
  return getCommonJunitConfig(testSuiteName, config);
};

const getCommonJunitConfig = (
  testSuite: string,
  config: Cypress.PluginConfigOptions
) => {
  if (!!config.env[envVarName]) {
    if (!config.reporterOptions) {
      config.reporterOptions = {};
    }
    const testSuiteName = `${capitalize(testSuite)} Test Suite`;
    config.reporterOptions.mochaJunitReporterReporterOptions = {
      mochaFile: 'cypress/results/test-results-[hash].xml',
      rootSuiteTitle: 'Cloud Manager Cypress Tests',
      testsuitesTitle: testSuiteName,
      jenkinsMode: true,
      suiteTitleSeparatedBy: '→',
    };
  }
  return config;
};

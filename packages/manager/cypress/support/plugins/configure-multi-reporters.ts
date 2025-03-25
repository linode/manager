import { CypressPlugin } from './plugin';
// The name of the environment variable to read when checking report configuration.
const envVarJunit = 'CY_TEST_JUNIT_REPORT';
const envVarHtml = 'CY_TEST_HTML_REPORT';

/**
 * Configure multiple reporters to be used by Cypress
 * Multireporter uses between 0 and 2 reporters (junit, html)
 * and for either core or component directory
 *
 * @returns Cypress configuration object.
 */
export const configureMultiReporters: CypressPlugin = (_on, config) => {
  const arrReporters = [];
  if (config.env[envVarJunit]) {
    console.log('Junit reporting configuration added.');
    arrReporters.push('mocha-junit-reporter');
  }
  if (config.env[envVarHtml]) {
    console.log('Html reporting configuration added.');
    arrReporters.push('cypress-mochawesome-reporter');
  }
  if (arrReporters.length > 0) {
    config.reporter = 'cypress-multi-reporters';
    if (!config.reporterOptions) {
      config.reporterOptions = {};
    }
    config.reporterOptions.reporterEnabled = arrReporters.join(', ');
  } else {
    console.log('No reporters configured.');
  }
  return config;
};

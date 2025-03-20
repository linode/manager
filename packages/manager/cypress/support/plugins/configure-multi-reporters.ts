import { CypressPlugin } from './plugin';
import cypressReporterLib from 'cypress-mochawesome-reporter/lib';
const { beforeRunHook, afterRunHook } = cypressReporterLib;
import { jUnitE2EReportOptions } from './junit-report';

/**
 * Configure multiple reporters to be used by Cypress
 *
 * @returns Cypress configuration object.
 */
export const configureMultiReporters: CypressPlugin = (on, config) => {
  config.reporter = 'cypress-multi-reporters';
  config.reporterOptions = {
    reporterEnabled: 'mocha-junit-reporter, cypress-mochawesome-reporter',
    //config.env['cypress_test_suite'] = 'core'
    mochaJunitReporterReporterOptions: jUnitE2EReportOptions(
      config.env['cypress_test_suite'],
      false
    ),
    cypressMochawesomeReporterReporterOptions: {
      reportPageTitle: 'Cloud Manager E2e Test Results',
      embeddedScreenshots: true,
      videoOnFailOnly: true,
      charts: true,
      quiet: true,
    },
  };

  // need hooks to insert results into html file by cypress-mochawesome-reporter
  on('before:run', async (results) => {
    await beforeRunHook(results);
  });

  on('after:run', async () => {
    await afterRunHook();
  });
  return config;
};

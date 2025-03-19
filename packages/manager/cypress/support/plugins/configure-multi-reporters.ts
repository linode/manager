import { CypressPlugin } from './plugin';
import cypressReporterLib from 'cypress-mochawesome-reporter/lib';
const { beforeRunHook, afterRunHook } = cypressReporterLib;
import { jUnitReportOptions } from './junit-report';

/**
 * Configure multiple reporters to be used by Cypress
 *
 * @returns Cypress configuration object.
 */
export const configureMultiReporters: CypressPlugin = (on, config) => {
  config.reporter = 'cypress-multi-reporters';
  config.reporterOptions = {
    reporterEnabled: 'mocha-junit-reporter, cypress-mochawesome-reporter',
    mochaJunitReporterReporterOptions: jUnitReportOptions(config),
    cypressMochawesomeReporterReporterOptions: {
      embeddedScreenshots: true,
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

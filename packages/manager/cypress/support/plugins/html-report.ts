import { CypressPlugin } from './plugin';
import cypressReporterLib from 'cypress-mochawesome-reporter/lib';
const { beforeRunHook, afterRunHook } = cypressReporterLib;

// The name of the environment variable to read when checking report configuration.
const envVarName = 'CY_TEST_HTML_REPORT';

/**
 * @returns Cypress configuration object.
 */
export const enableHtmlReport: CypressPlugin = async function (on, config) {
  if (!!config.env[envVarName]) {
    if (!config.reporterOptions) {
      config.reporterOptions = {};
    }
    config.reporterOptions.cypressMochawesomeReporterReporterOptions = {
      reportPageTitle: 'Cloud Manager E2e Test Results',
      embeddedScreenshots: true,
      videoOnFailOnly: true,
      charts: true,
      quiet: true,
    };
    on('before:run', async (results) => {
      await beforeRunHook(results);
    });

    on('after:run', async () => {
      await afterRunHook();
    });
  }
  return config;
};

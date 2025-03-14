import { CypressPlugin } from './plugin';
import cypressReporterLib from 'cypress-mochawesome-reporter/lib';
const { beforeRunHook, afterRunHook } = cypressReporterLib;

export const enableHtmlReport: CypressPlugin = async function (on, config) {
  config.reporter = 'cypress-mochawesome-reporter';
  config.reporterOptions = {
    embeddedScreenshots: true,
    charts: true,
    videoOnFailOnly: true,
    quiet: true,
  };
  on('before:run', async (results) => {
    await beforeRunHook(results);
  });

  on('after:run', async () => {
    await afterRunHook();
  });
};

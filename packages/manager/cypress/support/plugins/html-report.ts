import { CypressPlugin } from './plugin';
// @ts-expect-error cant figure out how to declare module for /lib
import cypressReporterLib from 'cypress-mochawesome-reporter/lib';
const { beforeRunHook, afterRunHook } = cypressReporterLib; 
 
export const enableHtmlReport: CypressPlugin = async (
  on,
  config
) => {
    config.reporter = 'cypress-mochawesome-reporter'; 
    on('before:run', async (results) => {
        await beforeRunHook(results);
      });

    on('after:run', async () => {
        await afterRunHook();
    }); 
    return config;
};
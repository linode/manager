/* eslint-disable no-console */
import { defineConfig } from 'cypress';
import { resolve } from 'path';
// switch to import syntax when esModuleInterop": true
// eslint-disable-next-line @typescript-eslint/no-var-requires
const vitePreprocessor = require('cypress-vite');
import * as dotenv from 'dotenv';

/**
 * Returns a configuration object containing environment variables.
 *
 * Environment variables are loaded from the `manager` package `.env` file, and
 * can be overridden via system environment variables.
 *
 * @returns Configuration.
 */
const loadConfiguration = (): Partial<Cypress.ConfigOptions> => {
  const dotenvPath = resolve(__dirname, '.env');
  const conf = dotenv.config({
    path: dotenvPath,
  });

  if (conf.error) {
    console.warn(
      `Error loading environment variables from .env file: ${conf.error}`
    );
    console.warn(
      '.env file will be ignored, but Cypress will use system environment variables that are defined'
    );
  }

  return {
    env: {
      ...(conf.parsed ?? []),
      ...process.env,
    },
  };
};

/**
 * Displays a warning if tests are running on an unsupported version of Node JS.
 */
const nodeVersionCheck = () => {
  const recommendedVersions = [18];
  const versionString = process.version.substr(1, process.version.length - 1);
  const currentVersion = versionString
    .split('.')
    .map((versionComponentString) => parseInt(versionComponentString, 10));

  if (!recommendedVersions.includes(currentVersion[0])) {
    console.warn(
      `You are running Node v${versionString}. We recommend the following versions of Node for these tests:`
    );
    recommendedVersions.forEach((recommendedVersion) => {
      console.warn(`  - v${recommendedVersion}.x`);
    });
  }
};

/**
 * Displays a warning if one region override var is specified but not the other.
 *
 * Cypress does not attempt to infer the region name if given an ID, nor vice-
 * versa, so the user must specify both the region ID (as used by Linode API)
 * and the region name (as shown in Cloud Manager's UI).
 */
const regionOverrideWarningCheck = (configWithEnv: Cypress.ConfigOptions) => {
  const overrideRegionId = configWithEnv.env?.['CY_TEST_REGION_ID'];
  const overrideRegionName = configWithEnv.env?.['CY_TEST_REGION_NAME'];

  // If one environment variable is specified but not the other, warn that they
  // will be disregarded.
  if (
    (!!overrideRegionId && !overrideRegionName) ||
    (!overrideRegionId && !!overrideRegionName)
  ) {
    console.warn(
      'Either CY_TEST_REGION_ID or CY_TEST_REGION_NAME was specified, but not both.'
    );
    console.warn(
      'CY_TEST_REGION_ID and CY_TEST_REGION_NAME must both be specified in order to override test region selection behavior.'
    );
  }
};

/**
 * Exports a Cypress configuration object.
 *
 * {@link https://docs.cypress.io/guides/references/configuration#Options | Cypress configuration documentation}
 */
export default defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 80000,
  pageLoadTimeout: 60000,
  trashAssetsBeforeRuns: false,
  viewportWidth: 1440,
  viewportHeight: 900,
  projectId: '5rhsif',
  requestTimeout: 30000,
  responseTimeout: 80000,
  retries: 2,
  experimentalMemoryManagement: true,
  e2e: {
    experimentalRunAllSpecs: true,
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.spec.{ts,tsx}',
    setupNodeEvents(on, config) {
      // Display warning if running an unsupported version of Node JS.
      nodeVersionCheck();

      // Get configuration by loading .env file, if one exists.
      const configWithEnv = {
        ...config,
        ...loadConfiguration(),
      };

      // Display warning if region override vars are defined incorrectly.
      regionOverrideWarningCheck(configWithEnv);

      on(
        'file:preprocessor',
        vitePreprocessor(resolve(__dirname, 'cypress', 'vite.config.ts'))
      );

      /*
       * Disable requests to Google's safe browsing API.
       *
       * We opt to disable these requests because they can be slow and have
       * contributed to test timeouts before.
       */
      on('before:browser:launch', (_browser, launchOptions) => {
        const originalPreferences = launchOptions.preferences.default;
        launchOptions.preferences.default = {
          ...originalPreferences,
          safebrowsing: {
            enabled: false,
          },
        };

        return launchOptions;
      });

      /*
       * Delete recordings for any specs that passed without requiring any
       * retries (ie only keep recordings for failed and flaky tests) during
       * runs in CI environments.
       *
       * This should save time by avoiding compressing and uploading recordings
       * that we don't need.
       */
      on('after:spec', (spec, results) => {
        if (results?.video) {
          const isFailedOrFlaky = results.tests.some((testResult) => {
            return testResult.attempts.some(
              (attempt) => attempt.state === 'failed'
            );
          });

          if (!isFailedOrFlaky && configWithEnv.env['CI']) {
            fs.unlinkSync(results.video);
          }
        }
      });

      return configWithEnv;
    },
  },
});

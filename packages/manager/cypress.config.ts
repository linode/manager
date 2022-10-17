import { defineConfig } from 'cypress'
import { resolve } from 'path';
import * as dotenv from 'dotenv';

/**
 * Returns a configuration object containing environment variables.
 *
 * Environment variables are loaded from the `manager` package `.env` file, and
 * can be overridden via system environment variables.
 *
 * @returns Configuration.
 */
const loadConfiguration = () => {
  const dotenvPath = resolve(__dirname, '.env');
  const conf = dotenv.config({
    path: dotenvPath,
  });

  if (conf.error) {
    console.warn(`Error loading environment variables from .env file: ${conf.error}`);
    console.warn('.env file will be ignored, but Cypress will use system environment variables that are defined');
  }

  return {
    env: {
      ...conf.parsed ?? [],
      ...process.env,
    },
  };
};

/**
 * Displays a warning if tests are running on an unsupported version of Node JS.
 */
const nodeVersionCheck = () => {
  const recommendedVersions = [14];
  const versionString = process.version.substr(1, process.version.length - 1);
  const currentVersion = versionString
    .split('.')
    .map((versionComponentString) => parseInt(versionComponentString, 10));

  if (!recommendedVersions.includes(currentVersion[0])) {
    console.warn(`You are running Node v${versionString}. We recommend the following versions of Node for these tests:`);
    recommendedVersions.forEach((recommendedVersion) => {
      console.warn(`  - v${recommendedVersion}.x`);
    });
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
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.spec.{ts,tsx}',
    setupNodeEvents(on, config) {
      // Display warning if running an unsupported version of Node JS.
      nodeVersionCheck();

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

      // Return configuration by loading .env file, if one exists.
      return {
        ...config,
        ...loadConfiguration(),
      };
    },
  },
});

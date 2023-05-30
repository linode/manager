/* eslint-disable no-console */
import { defineConfig } from 'cypress';

import { setupPlugins } from './cypress/support/plugins';
import { disableGoogleSafeBrowsing } from './cypress/support/plugins/disable-google-safe-browsing';
import { discardPassedTestRecordings } from './cypress/support/plugins/discard-passed-test-recordings';
import { loadEnvironmentConfig } from './cypress/support/plugins/load-env-config';
import { nodeVersionCheck } from './cypress/support/plugins/node-version-check';
import { vitePreprocess } from './cypress/support/plugins/vite-preprocessor';

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
    specPattern: 'cypress/e2e/core/**/*.spec.{ts,tsx}',
    setupNodeEvents(on, config) {
      return setupPlugins(on, config, [
        nodeVersionCheck,
        loadEnvironmentConfig,
        vitePreprocess,
        disableGoogleSafeBrowsing,
        discardPassedTestRecordings,
      ]);
    },
  },
});

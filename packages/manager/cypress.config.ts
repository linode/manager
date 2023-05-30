/* eslint-disable no-console */
import { defineConfig } from 'cypress';

import { setupPlugins } from './cypress/support/plugins';
import { disableGoogleSafeBrowsing } from './cypress/support/plugins/disable-google-safe-browsing';
import { discardPassedTestRecordings } from './cypress/support/plugins/discard-passed-test-recordings';
import { loadEnvironmentConfig } from './cypress/support/plugins/load-env-config';
import { nodeVersionCheck } from './cypress/support/plugins/node-version-check';
import { regionOverrideCheck } from './cypress/support/plugins/region-override-check';
import { vitePreprocess } from './cypress/support/plugins/vite-preprocessor';

/**
 * Exports a Cypress configuration object.
 *
 * {@link https://docs.cypress.io/guides/references/configuration#Options | Cypress configuration documentation}
 */
export default defineConfig({
  trashAssetsBeforeRuns: false,
  projectId: '5rhsif',

  // Browser configuration.
  chromeWebSecurity: false,
  viewportWidth: 1440,
  viewportHeight: 900,

  // Timeouts.
  requestTimeout: 30000,
  responseTimeout: 80000,
  defaultCommandTimeout: 80000,
  pageLoadTimeout: 60000,

  // Only retry test when running via CI.
  retries: process.env['CI'] ? 2 : 0,

  experimentalMemoryManagement: true,
  e2e: {
    experimentalRunAllSpecs: true,
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/core/**/*.spec.{ts,tsx}',
    setupNodeEvents(on, config) {
      return setupPlugins(on, config, [
        loadEnvironmentConfig,
        nodeVersionCheck,
        regionOverrideCheck,
        vitePreprocess,
        disableGoogleSafeBrowsing,
        discardPassedTestRecordings,
      ]);
    },
  },
});

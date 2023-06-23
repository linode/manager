/* eslint-disable no-console */
import { defineConfig } from 'cypress';
import { setupPlugins } from './cypress/support/plugins';
import { configureTestSuite } from './cypress/support/plugins/configure-test-suite';
import { disableGoogleSafeBrowsing } from './cypress/support/plugins/disable-google-safe-browsing';
import { discardPassedTestRecordings } from './cypress/support/plugins/discard-passed-test-recordings';
import { loadEnvironmentConfig } from './cypress/support/plugins/load-env-config';
import { nodeVersionCheck } from './cypress/support/plugins/node-version-check';
import { regionOverrideCheck } from './cypress/support/plugins/region-override-check';
import { vitePreprocess } from './cypress/support/plugins/vite-preprocessor';
import { oauthTokenCheck } from './cypress/support/plugins/oauth-token-check';
import { fetchLinodeRegions } from './cypress/support/plugins/fetch-linode-regions';

/**
 * Exports a Cypress configuration object.
 *
 * {@link https://docs.cypress.io/guides/references/configuration#Options | Cypress configuration documentation}
 */
export default defineConfig({
  // Browser configuration.
  chromeWebSecurity: false,
  defaultCommandTimeout: 80000,

  e2e: {
    // This can be overridden using `CYPRESS_BASE_URL`.
    baseUrl: 'http://localhost:3000',

    experimentalRunAllSpecs: true,

    // This is overridden when `CY_SUITE` is defined.
    setupNodeEvents(on, config) {
      return setupPlugins(on, config, [
        loadEnvironmentConfig,
        nodeVersionCheck,
        oauthTokenCheck,
        configureTestSuite,
        vitePreprocess,
        disableGoogleSafeBrowsing,
        discardPassedTestRecordings,
        fetchLinodeRegions,
        regionOverrideCheck,
      ]);
    },

    // See `cypress/support/plugins/configure-test-suite.ts`.
    specPattern: 'cypress/e2e/core/**/*.spec.{ts,tsx}',
  },
  experimentalMemoryManagement: true,
  pageLoadTimeout: 60000,

  projectId: '5rhsif',
  // Timeouts.
  requestTimeout: 30000,
  responseTimeout: 80000,
  // Only retry test when running via CI.
  retries: process.env['CI'] ? 2 : 0,

  trashAssetsBeforeRuns: false,

  viewportHeight: 900,
  viewportWidth: 1440,
});

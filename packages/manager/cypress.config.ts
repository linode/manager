/* eslint-disable no-console */
import { defineConfig } from 'cypress';
import { setupPlugins } from './cypress/support/plugins';
import { configureFileWatching } from './cypress/support/plugins/configure-file-watching';
import { configureTestSuite } from './cypress/support/plugins/configure-test-suite';
import { disableGoogleSafeBrowsing } from './cypress/support/plugins/disable-google-safe-browsing';
import { discardPassedTestRecordings } from './cypress/support/plugins/discard-passed-test-recordings';
import { loadEnvironmentConfig } from './cypress/support/plugins/load-env-config';
import { nodeVersionCheck } from './cypress/support/plugins/node-version-check';
import { regionOverrideCheck } from './cypress/support/plugins/region-override-check';
import { vitePreprocess } from './cypress/support/plugins/vite-preprocessor';
import { authenticateApi } from './cypress/support/plugins/authenticate-api';
import { fetchLinodeRegions } from './cypress/support/plugins/fetch-linode-regions';
import { splitCypressRun } from './cypress/support/plugins/split-run';
import { enableJunitReport } from './cypress/support/plugins/junit-report';

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

    // This can be overridden using `CYPRESS_BASE_URL`.
    baseUrl: 'http://localhost:3000',

    // This is overridden when `CY_TEST_SUITE` is defined.
    // See `cypress/support/plugins/configure-test-suite.ts`.
    specPattern: 'cypress/e2e/core/**/*.spec.{ts,tsx}',

    setupNodeEvents(on, config) {
      return setupPlugins(on, config, [
        loadEnvironmentConfig,
        nodeVersionCheck,
        authenticateApi,
        configureFileWatching,
        configureTestSuite,
        vitePreprocess,
        disableGoogleSafeBrowsing,
        discardPassedTestRecordings,
        fetchLinodeRegions,
        regionOverrideCheck,
        splitCypressRun,
        enableJunitReport,
      ]);
    },
  },
});

/* eslint-disable no-console */
import { defineConfig } from 'cypress';
import { setupPlugins } from './cypress/support/plugins';
import { configureBrowser } from './cypress/support/plugins/configure-browser';
import { configureFileWatching } from './cypress/support/plugins/configure-file-watching';
import { configureTestSuite } from './cypress/support/plugins/configure-test-suite';
import { discardPassedTestRecordings } from './cypress/support/plugins/discard-passed-test-recordings';
import { loadEnvironmentConfig } from './cypress/support/plugins/load-env-config';
import { nodeVersionCheck } from './cypress/support/plugins/node-version-check';
import { regionOverrideCheck } from './cypress/support/plugins/region-override-check';
import { vitePreprocess } from './cypress/support/plugins/vite-preprocessor';
import { configureApi } from './cypress/support/plugins/configure-api';
import { fetchAccount } from './cypress/support/plugins/fetch-account';
import { fetchLinodeRegions } from './cypress/support/plugins/fetch-linode-regions';
import { splitCypressRun } from './cypress/support/plugins/split-run';
import { enableJunitReport } from './cypress/support/plugins/junit-report';
import { generateTestWeights } from './cypress/support/plugins/generate-weights';
import { logTestTagInfo } from './cypress/support/plugins/test-tagging-info';
import cypressViteConfig from './cypress/vite.config';
import { featureFlagOverrides } from './cypress/support/plugins/feature-flag-override';
import { postRunCleanup } from './cypress/support/plugins/post-run-cleanup';
import { resetUserPreferences } from './cypress/support/plugins/reset-user-preferences';

/**
 * Exports a Cypress configuration object.
 *
 * {@link https://docs.cypress.io/guides/references/configuration#Options | Cypress configuration documentation}
 */
export default defineConfig({
  trashAssetsBeforeRuns: false,

  // Browser configuration.
  chromeWebSecurity: false,
  viewportWidth: 1440,
  viewportHeight: 900,

  // Timeouts.
  requestTimeout: 30000,
  responseTimeout: 80000,
  defaultCommandTimeout: 80000,
  pageLoadTimeout: 60000,

  // Recording and test troubleshooting.
  projectId: '5rhsif',
  screenshotOnRunFailure: true,
  video: true,

  // Only retry test when running via CI.
  retries: process.env['CI'] && !process.env['CY_TEST_DISABLE_RETRIES'] ? 2 : 0,

  experimentalMemoryManagement: true,

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: cypressViteConfig,
    },
    indexHtmlFile: './cypress/support/component/index.html',
    supportFile: './cypress/support/component/setup.tsx',
    specPattern: './cypress/component/**/*.spec.tsx',
    viewportWidth: 500,
    viewportHeight: 500,

    setupNodeEvents(on, config) {
      return setupPlugins(on, config, [
        loadEnvironmentConfig,
        discardPassedTestRecordings,
        enableJunitReport('Component', true),
      ]);
    },
  },

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
        configureApi,
        configureFileWatching,
        configureTestSuite,
        configureBrowser,
        vitePreprocess,
        discardPassedTestRecordings,
        fetchAccount,
        fetchLinodeRegions,
        resetUserPreferences,
        regionOverrideCheck,
        featureFlagOverrides,
        logTestTagInfo,
        splitCypressRun,
        enableJunitReport(),
        generateTestWeights,
        postRunCleanup,
      ]);
    },
  },
});

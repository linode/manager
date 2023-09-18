/**
 * @file Allows Cypress file watching to be configured via env vars or .env files.
 */

import type { CypressPlugin } from './plugin';

// The name of the environment variable to read when checking file watch configuration.
const envVarName = 'CY_TEST_DISABLE_FILE_WATCHING';

/**
 * Optionally disables file watching when using the Cypress debugger.
 *
 * File watching is disabled if `CY_TEST_DISABLE_FILE_WATCHING` is set, and
 * remains enabled otherwise.
 *
 * @returns Cypress configuration object.
 */
export const configureFileWatching: CypressPlugin = (_on, config) => {
  const shouldWatch = !config.env[envVarName];
  config.watchForFileChanges = shouldWatch;
  return config;
};

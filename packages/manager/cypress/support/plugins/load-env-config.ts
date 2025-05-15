import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

import type { CypressPlugin } from './plugin';

/**
 * Populates Cypress configuration `env` object with environment variables.
 *
 * If present, environment variables will also be loaded from `packages/manager/.env`.
 *
 * @returns Configuration with environment variables.
 */
export const loadEnvironmentConfig: CypressPlugin = (
  _on,
  config
): Cypress.PluginConfigOptions => {
  const dotenvPath = resolve(
    fileURLToPath(import.meta.url),
    '..',
    '..',
    '..',
    '..',
    '.env'
  );
  const conf = dotenv.config({
    path: dotenvPath,
  });

  if (conf.error) {
    console.warn(
      'Failed to load .env file from `packages/manager/.env`. Does the file exist?'
    );
    console.warn(conf.error);
    console.warn('.env file will be ignored.');
  }

  return {
    ...config,
    env: {
      ...config.env,
      ...(conf.parsed ?? []),
      ...process.env,
    },
  };
};

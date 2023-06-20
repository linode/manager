import { CypressPlugin } from './plugin';

/**
 * Checks for the presence of `MANAGER_OAUTH` environment variable.
 *
 * If `MANAGER_OAUTH` is not defined, an error is thrown and the tests will
 * not run.
 */
export const oauthTokenCheck: CypressPlugin = (_on, config): void => {
  const token = config.env?.['MANAGER_OAUTH'];
  if (!token) {
    console.error('No `MANAGER_OAUTH` environment variable has been defined.');
    console.error(
      'Define `MANAGER_OAUTH` in your .env file to run Cloud Manager Cypress tests.'
    );
    throw new Error('`MANAGER_OAUTH` is not defined.');
  }
};

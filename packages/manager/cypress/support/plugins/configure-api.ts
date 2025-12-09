import { getProfile } from '@linode/api-v4';

import { configureLinodeApi, defaultApiRoot } from '../util/api';

import type { CypressPlugin } from './plugin';
import type { Profile } from '@linode/api-v4';

/**
 * Configures API requests to use configure access token and API root.
 *
 * This configuration only applies to API requests made during Cypress start-up,
 * and does not apply to test code.
 *
 * The personal access token is retrieved from the `MANAGER_OAUTH` environment
 * variable, and the API root URL is retrieved from the `REACT_APP_API_ROOT`
 * environment variable.
 */
export const configureApi: CypressPlugin = async (
  _on,
  config
): Promise<void> => {
  const token = config.env?.['MANAGER_OAUTH'];
  const apiBaseUrl = config.env?.['REACT_APP_API_ROOT'];

  if (!token) {
    console.error('No `MANAGER_OAUTH` environment variable has been defined.');
    console.error(
      'Define `MANAGER_OAUTH` in your .env file to run Cloud Manager Cypress tests.'
    );
    throw new Error('`MANAGER_OAUTH` is not defined.');
  }

  // Configure API, attempt to make an API request.
  configureLinodeApi(token, apiBaseUrl);
  let profile: null | Profile = null;
  try {
    profile = await getProfile();

    // If enabled, report information about the API user.
    // This is disabled by default because we may not want to expose account
    // information to all environments (e.g. public GitHub Actions runs).
    const showUserInfo = !!config.env?.['CY_TEST_USER_REPORT'];
    const userInfo = {
      'Test User Name': profile.username,
      'Test User Email': profile.email,
      'Test User UID': profile.uid,
      'Test User Timezone': profile.timezone,
    };

    console.table({
      'API Request Root URL': apiBaseUrl ?? defaultApiRoot,
      ...(showUserInfo ? userInfo : {}),
    });
  } catch (e: any) {
    console.error(
      'Failed to make successful request to Linode API using OAuth token.'
    );
    if (e.message) {
      console.error(e.message);
    }
    throw new Error('Failed to make request to Linode API-v4.');
  }
};

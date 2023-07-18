import { CypressPlugin } from './plugin';
import { baseRequest, getProfile, Profile } from '@linode/api-v4';

/*
 * Authenticate API requests. Necessary to fetch list of Linode regions.
 */
const authenticateWithToken = (apiOauthToken: string) => {
  baseRequest.interceptors.request.use((config) => {
    return {
      ...config,
      headers: {
        ...config.headers,
        common: {
          ...config.headers.common,
          authorization: `Bearer ${apiOauthToken}`,
        },
      },
    };
  });
};

/**
 * Checks for the presence of `MANAGER_OAUTH` environment variable.
 * Authenticates the Linode APIv4 library so subequent plugins can utilize it.
 *
 * If the `MANAGER_OAUTH` environment variable is not defined, or if API
 * authentication otherwise fails, an error is thrown and the tests will not
 * run.
 */
export const authenticateApi: CypressPlugin = async (
  _on,
  config
): Promise<void> => {
  const token = config.env?.['MANAGER_OAUTH'];
  if (!token) {
    console.error('No `MANAGER_OAUTH` environment variable has been defined.');
    console.error(
      'Define `MANAGER_OAUTH` in your .env file to run Cloud Manager Cypress tests.'
    );
    throw new Error('`MANAGER_OAUTH` is not defined.');
  }

  authenticateWithToken(token);
  let profile: Profile | null = null;
  try {
    profile = await getProfile();
  } catch (e: any) {
    console.error(
      'Failed to make successful request to Linode API using OAuth token.'
    );
    if (e.message) {
      console.error(e.message);
    }
    throw new Error('Failed to make request to Linode APIv4.');
  }

  // If enabled, report information about the API user.
  // This is disabled by default because we may not want to expose account
  // information to all environments (e.g. public GitHub Actions runs).
  if (config.env?.['CY_TEST_USER_REPORT']) {
    console.info('Test user information:');
    console.table({ Username: profile.username });
  }
};

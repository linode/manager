import { CypressPlugin } from './plugin';
import { baseRequest, getProfile, Profile } from '@linode/api-v4';

const defaultApiRoot = 'https://api.linode.com/v4';

/**
 * Returns an object containing an overridden API request URL.
 *
 * If no request URL or base override URL is passed, an empty object is returned.
 *
 * @param requestUrl - API request URL.
 * @param baseUrl - API base URL override.
 *
 * @returns API request URL override object.
 */
const getApiRequestUrlOverride = (requestUrl?: string, baseUrl?: string) => {
  // Short-circuit and return an empty object if no base URL is passed.
  if (!baseUrl || !requestUrl) {
    return {};
  }
  const overriddenUrl = requestUrl.replace(defaultApiRoot, baseUrl);
  return {
    url: overriddenUrl,
  };
};

/**
 * Authenticate API requests. Necessary to make API requests during Cypress start-up.
 * Configure Linode API-v4 API requests.
 *
 * This is necessary to make API requests during Cypress start-up. It
 * authenticates the API and configures it to make requests to the correct
 * environment.
 *
 * @param apiAccessToken - Personal access token for API requests.
 * @param baseUrlOverride - Optional base URL with which to override API requests.
 */
const configureApiRequests = (
  apiAccessToken: string,
  baseUrlOverride?: string
) => {
  baseRequest.interceptors.request.use((config) => {
    return {
      ...config,
      headers: {
        ...config.headers,
        common: {
          ...config.headers.common,
          authorization: `Bearer ${apiAccessToken}`,
        },
      },
      ...getApiRequestUrlOverride(config.url, baseUrlOverride),
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
  configureApiRequests(token, apiBaseUrl);
  let profile: Profile | null = null;
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

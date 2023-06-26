import type { CypressPlugin } from './plugin';
import type { ResourcePage, Region } from '@linode/api-v4';
import { baseRequest, getRegions } from '@linode/api-v4';

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
 * Fetches Linode regions and stores data in Cypress `cloudManagerRegions` env.
 *
 * Throws an error if no OAuth token (used for regions API request) is defined.
 */
export const fetchLinodeRegions: CypressPlugin = async (on, config) => {
  const oauthToken = config?.env?.['MANAGER_OAUTH'];
  if (!oauthToken) {
    throw new Error(
      `Unable to fetch Linode regions because 'MANAGER_OAUTH' environment variable is not defined.`
    );
  }

  authenticateWithToken(oauthToken);
  const regions: ResourcePage<Region> = await getRegions({ page_size: 500 });

  return {
    ...config,
    env: {
      ...config.env,
      cloudManagerRegions: regions.data,
    },
  };
};

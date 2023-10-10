import type { CypressPlugin } from './plugin';
import { getAccountInfo } from '@linode/api-v4';

/**
 * Fetches Linode account info and stores data in Cypress `cloudManagerAccount` env.
 */
export const fetchAccount: CypressPlugin = async (_on, config) => {
  const account = await getAccountInfo();

  return {
    ...config,
    env: {
      ...config.env,
      cloudManagerAccount: account,
    },
  };
};

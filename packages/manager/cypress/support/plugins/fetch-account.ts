import type { CypressPlugin } from './plugin';
import { getAccountInfo, getAccountSettings } from '@linode/api-v4';

/**
 * Fetches and caches Linode account info and settings.
 *
 * Cached account data is stored in Cypress's `cloudManagerAccount` and
 * `cloudManagerAccountSettings` env, respectively.
 */
export const fetchAccount: CypressPlugin = async (_on, config) => {
  const [account, accountSettings] = await Promise.all([
    getAccountInfo(),
    getAccountSettings(),
  ]);

  return {
    ...config,
    env: {
      ...config.env,
      cloudManagerAccount: account,
      cloudManagerAccountSettings: accountSettings,
    },
  };
};

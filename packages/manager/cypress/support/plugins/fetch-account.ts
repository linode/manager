import { getAccountInfo, getAccountSettings, getProfile } from '@linode/api-v4';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';

import type { CypressPlugin } from './plugin';
import type { Account } from '@linode/api-v4';

/**
 * The name of the environment variable that controls account cache reading.
 */
const envVarName = 'CY_TEST_ACCOUNT_CACHE_DIR';

/**
 * Fetches and caches Linode account info and settings.
 *
 * Cached account data is stored in Cypress's `cloudManagerAccount` and
 * `cloudManagerAccountSettings` env, respectively.
 */
export const fetchAccount: CypressPlugin = async (_on, config) => {
  // Fetch profile and account settings first, since there is a comparatively
  // low likelihood that these requests will fail.
  const [profile, accountSettings] = await Promise.all([
    getProfile(),
    getAccountSettings(),
  ]);

  /**
   * Cached account data for the desired test account if it is available, or `undefined`.
   */
  const accountCacheData = (() => {
    if (!config.env[envVarName]) {
      return undefined;
    }

    const accountCacheDir = config.env[envVarName];
    const accountCachePath = resolve(
      join(accountCacheDir, `${profile.uid}.json`)
    );

    try {
      const cacheJson = readFileSync(accountCachePath, 'utf8');
      const cacheData = JSON.parse(cacheJson);

      if ('account' in cacheData) {
        return cacheData['account'] as Account;
      }
    } catch (e) {
      // TODO Error message.
      console.error(`Failed to read account cache file at ${accountCachePath}`);
      if ('message' in e) {
        console.error(e.message);
      }
      return undefined;
    }

    return undefined;
  })();

  // Fetch account info, falling back to offline cached data if it is
  // enabled and available.
  let account: Account | undefined = undefined;
  try {
    account = await getAccountInfo();
  } catch (e) {
    console.error(
      'An error occurred while retrieving test account information.'
    );

    // Re-throw the error if no cached account data is available, because the
    // test run cannot continue.
    if (!accountCacheData) {
      throw e;
    }
    // Otherwise, note that the original account fetch failed and that the tests
    // will be proceeding using cached data.
    else {
      if (e.message) {
        console.error(e.message);
      }
      console.info(
        'Cached account data is available and will be used instead.'
      );
    }
  }

  return {
    ...config,
    env: {
      ...config.env,
      cloudManagerAccount: account || accountCacheData,
      cloudManagerAccountSettings: accountSettings,
    },
  };
};

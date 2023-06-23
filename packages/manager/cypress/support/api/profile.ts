import { isTestLabel } from 'support/api/common';
import {
  getOAuthClients,
  OAuthClient,
  deleteOAuthClient,
} from '@linode/api-v4';
import { depaginate } from 'support/util/paginate';
import { pageSize } from 'support/constants/api';

/**
 * Deletes all oauth apps which are prefixed with the test entity prefix.
 *
 * @returns Promise that resolves when oauth apps have been deleted.
 */
export const deleteAllTestOAuthApps = async (): Promise<void> => {
  const oauthApps = await depaginate<OAuthClient>((page: number) =>
    getOAuthClients({ page, page_size: pageSize })
  );

  console.log(`oauth apps: ${JSON.stringify(oauthApps)}`);

  const deletionPromises = oauthApps
    .filter((oauthApp: OAuthClient) => isTestLabel(oauthApp.label))
    .map(async (oauthApp: OAuthClient) => {
      console.log(`deleting ${oauthApp.label}`);
      await deleteOAuthClient(oauthApp.id);
    });

  await Promise.all(deletionPromises);
};

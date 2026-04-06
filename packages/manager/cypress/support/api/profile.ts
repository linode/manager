import {
  deleteOAuthClient,
  deleteSSHKey,
  getOAuthClients,
  getSSHKeys,
} from '@linode/api-v4';
import { isTestLabel } from 'support/api/common';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';

import type { OAuthClient, SSHKey } from '@linode/api-v4';

/**
 * Deletes all oauth apps which are prefixed with the test entity prefix.
 *
 * @returns Promise that resolves when oauth apps have been deleted.
 */
export const deleteAllTestOAuthApps = async (): Promise<void> => {
  const oauthApps = await depaginate<OAuthClient>((page: number) =>
    getOAuthClients({ page, page_size: pageSize })
  );

  const deletionPromises = oauthApps
    .filter((oauthApp: OAuthClient) => isTestLabel(oauthApp.label))
    .map(async (oauthApp: OAuthClient) => {
      console.log(`deleting ${oauthApp.label}`);
      await deleteOAuthClient(oauthApp.id);
    });

  await Promise.all(deletionPromises);
};

export const deleteAllTestSSHKeys = async (): Promise<void> => {
  const sshKeys = await depaginate<SSHKey>((page: number) => {
    return getSSHKeys({ page, page_size: pageSize });
  });

  const deletionPromises = sshKeys
    .filter((sshKey: SSHKey) => isTestLabel(sshKey.label))
    .map(async (sshKey: SSHKey) => {
      console.log(`deleting ${sshKey.label}`);
      await deleteSSHKey(sshKey.id);
    });

  await Promise.all(deletionPromises);
};

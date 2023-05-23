import { apiCheckErrors } from './common';
import { isTestLabel } from 'support/api/common';
import { randomDomainName } from 'support/util/random';
import {
  Domain,
  getDomains,
  deleteDomain,
  getOAuthApps,
  OAuthClient,
  deleteOAuthApp,
} from '@linode/api-v4';
import { depaginate } from 'support/util/paginate';
import { oauthToken, pageSize } from 'support/constants/api';

/**
 * Deletes all oauth apps which are prefixed with the test entity prefix.
 *
 * @returns Promise that resolves when oauth apps have been deleted.
 */
export const deleteAllTestOAuthApps = async (): Promise<void> => {
  const oauthApps = await depaginate<OAuthClient>((page: number) =>
    getOAuthApps({ page_size: pageSize, page })
  );

  console.log(`oauth apps: ${JSON.stringify(oauthApps)}`);

  const deletionPromises = oauthApps
    .filter((oauthApp: OAuthClient) => isTestLabel(oauthApp.label))
    .map(async (oauthApp: OAuthClient) => {
      console.log(`deleting ${oauthApp.label}`);
      await deleteOAuthApp(oauthApp.id);
    });

  await Promise.all(deletionPromises);
};

// export const deleteAllTestVolumes = async (): Promise<void> => {
//   const volumes = await depaginate<Volume>((page: number) =>
//     getVolumes({ page_size: pageSize, page })
//   );

//   const detachDeletePromises = volumes
//     .filter((volume: Volume) => isTestLabel(volume.label))
//     .map(async (volume: Volume) => {
//       if (volume.linode_id) {
//         await detachVolume(volume.id);
//       }
//       await deleteVolume(volume.id);
//     });

//   await Promise.all(detachDeletePromises);
// };

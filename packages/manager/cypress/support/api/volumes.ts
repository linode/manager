import { Volume, deleteVolume, detachVolume, getVolumes } from '@linode/api-v4';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';

import { isTestLabel } from './common';

/**
 * Delete all Volumes whose labels are prefixed "cy-test-".
 *
 * If any Volumes are attached to a Linode, they will be detached before being
 * deleted.
 *
 * @returns Promise that resolves when Volumes have been detached and deleted.
 */
export const deleteAllTestVolumes = async (): Promise<void> => {
  const volumes = await depaginate<Volume>((page: number) =>
    getVolumes({ page, page_size: pageSize })
  );

  const detachDeletePromises = volumes
    .filter((volume: Volume) => isTestLabel(volume.label))
    .map(async (volume: Volume) => {
      if (volume.linode_id) {
        await detachVolume(volume.id);
      }
      await deleteVolume(volume.id);
    });

  await Promise.all(detachDeletePromises);
};

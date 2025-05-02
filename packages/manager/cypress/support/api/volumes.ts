import {
  createVolume,
  deleteVolume,
  detachVolume,
  getVolumes,
} from '@linode/api-v4';
import { pageSize } from 'support/constants/api';
import { attemptWithBackoff, SimpleBackoffMethod } from 'support/util/backoff';
import { depaginate } from 'support/util/paginate';
import { pollVolumeStatus } from 'support/util/polling';

import { isTestLabel } from './common';

import type { Volume, VolumeRequestPayload } from '@linode/api-v4';

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
    .filter(
      (volume: Volume) =>
        isTestLabel(volume.label) && volume.status === 'active'
    )
    .map(async (volume: Volume) => {
      if (volume.linode_id) {
        await detachVolume(volume.id);
      }
      /*
       * Make 10 attempts to delete the volume, waiting 10 seconds between
       * each attempt.
       *
       * This is necessary when the volume has been recently detached; the API
       * request to detach the volume responds successfully, indicating that the
       * volume has been detached, but subsequent attempts to delete the volume
       * often fail with an error message indicating that the volume has not yet
       * been detached.
       */
      const backoff = new SimpleBackoffMethod(10000, {
        maxAttempts: 10,
      });

      await attemptWithBackoff(backoff, () => deleteVolume(volume.id));
    });

  await Promise.all(detachDeletePromises);
};

/**
 * Creates a Volume and waits for it to become active.
 *
 * @param volumeRequest - Volume create request payload.
 *
 * @returns Promise that resolves to created Volume.
 */
export const createActiveVolume = async (
  volumeRequest: VolumeRequestPayload
) => {
  const volume = await createVolume(volumeRequest);
  await pollVolumeStatus(volume.id, 'active', new SimpleBackoffMethod(10000));
  return volume;
};

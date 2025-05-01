import { BETA_API_ROOT } from '../constants';
import Request, { setData, setMethod, setURL } from '../request';

import type { VolumesMigrationQueue } from './types';

/**
 * getVolumesMigrationQueue
 *
 * Returns the number of Linodes and Volumes in the migration queue for a region.
 *
 */
export const getVolumesMigrationQueue = (region: string) =>
  Request<VolumesMigrationQueue>(
    setURL(
      `${BETA_API_ROOT}/regions/${encodeURIComponent(region)}/migration-queue`,
    ),
    setMethod('GET'),
  );

/**
 * migrateVolumes
 *
 * Adds the specified Volumes to the migration queue
 *
 * @param volumes - array of the ids of the volumes you intend to migrate
 */
export const migrateVolumes = (volumes: number[]) => {
  return Request<{}>(
    setURL(`${BETA_API_ROOT}/volumes/migrate`),
    setMethod('POST'),
    setData({ volumes }),
  );
};

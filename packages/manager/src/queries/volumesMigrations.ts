import { APIError } from '@linode/api-v4/lib/types';
import {
  getVolumesMigrationQueue,
  migrateVolumes,
} from '@linode/api-v4/lib/volumes/migrations';
import { VolumesMigrationQueue } from '@linode/api-v4/lib/volumes/types';
import { useMutation, useQuery } from '@tanstack/react-query';

import { queryPresets } from './base';

const queryKey = 'volumes-migrations';

export const useVolumesMigrationQueueQuery = (
  region: string,
  enabled: boolean
) =>
  useQuery<VolumesMigrationQueue, APIError[]>(
    [`${queryKey}-queue`, region],
    () => getVolumesMigrationQueue(region),
    { ...queryPresets.shortLived, enabled }
  );

export const useVolumesMigrateMutation = () =>
  useMutation<{}, APIError[], number[]>(migrateVolumes);

import { APIError } from '@linode/api-v4';
import { useMutation, useQuery } from 'react-query';
import { queryPresets } from './base';
import { VolumesMigrationQueue } from '@linode/api-v4';
import { getVolumesMigrationQueue, migrateVolumes } from '@linode/api-v4';

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

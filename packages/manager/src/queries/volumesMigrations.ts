import { APIError } from '@linode/api-v4/lib/types';
import {
  getVolumesMigrationQueue,
  migrateVolumes,
} from '@linode/api-v4/lib/volumes/migrations';
import { VolumesMigrationQueue } from '@linode/api-v4/lib/volumes/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { accountQueries } from './account/queries';
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

export const useVolumesMigrateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[], number[]>({
    mutationFn: migrateVolumes,
    onSuccess: () => {
      // If a customer "force" migrates they will then see a
      // `volume_migration_imminent` notification instead of
      // the `volume_migration_scheduled` notification.
      setTimeout(() => {
        // Refetch notifications after 1.5 seconds. The API needs some time to process.
        queryClient.invalidateQueries(accountQueries.notifications.queryKey);
      }, 1500);
    },
  });
};

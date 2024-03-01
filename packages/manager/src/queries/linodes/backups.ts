import {
  APIError,
  LinodeBackupsResponse,
  cancelBackups,
  enableBackups,
  getLinodeBackups,
  restoreBackup,
  takeSnapshot,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKey } from './linodes';

export const useLinodeBackupsQuery = (id: number, enabled = true) => {
  return useQuery<LinodeBackupsResponse, APIError[]>(
    [queryKey, 'linode', id, 'backups'],
    () => getLinodeBackups(id),
    { enabled }
  );
};

export const useLinodeBackupsEnableMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => enableBackups(id), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
      queryClient.invalidateQueries([queryKey, 'linode', id, 'details']);
    },
  });
};

export const useLinodeBackupsCancelMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => cancelBackups(id), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
      queryClient.invalidateQueries([queryKey, 'linode', id, 'details']);
    },
  });
};

export const useLinodeBackupSnapshotMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { label: string }>(
    ({ label }) => takeSnapshot(id, label),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'linode', id, 'backups']);
        queryClient.invalidateQueries([queryKey, 'linode', id, 'details']);
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.invalidateQueries([queryKey, 'all']);
        queryClient.invalidateQueries([queryKey, 'infinite']);
      },
    }
  );
};

export const useLinodeBackupRestoreMutation = () => {
  return useMutation<
    {},
    APIError[],
    {
      backupId: number;
      linodeId: number;
      overwrite: boolean;
      targetLinodeId: number;
    }
  >(({ backupId, linodeId, overwrite, targetLinodeId }) =>
    restoreBackup(linodeId, backupId, targetLinodeId, overwrite)
  );
};

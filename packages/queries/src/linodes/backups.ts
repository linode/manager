import {
  cancelBackups,
  enableBackups,
  restoreBackup,
  takeSnapshot,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { linodeQueries } from './linodes';

import type { APIError, LinodeBackupsResponse } from '@linode/api-v4';

export const useLinodeBackupsQuery = (id: number, enabled = true) => {
  return useQuery<LinodeBackupsResponse, APIError[]>({
    ...linodeQueries.linode(id)._ctx.backups,
    enabled,
  });
};

export const useLinodeBackupsEnableMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => enableBackups(id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });
      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(id).queryKey,
      });
    },
  });
};

export const useLinodeBackupsCancelMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => cancelBackups(id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });
      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(id).queryKey,
      });
    },
  });
};

export const useLinodeBackupSnapshotMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { label: string }>({
    mutationFn: ({ label }) => takeSnapshot(id, label),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linodes.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: linodeQueries.linode(id)._ctx.backups.queryKey,
      });
      queryClient.invalidateQueries({
        exact: true,
        queryKey: linodeQueries.linode(id).queryKey,
      });
    },
  });
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
  >({
    mutationFn: ({ backupId, linodeId, overwrite, targetLinodeId }) =>
      restoreBackup(linodeId, backupId, targetLinodeId, overwrite),
  });
};

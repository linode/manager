import { enableBackups } from '@linode/api-v4';
import { pluralize } from '@linode/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { linodeQueries } from 'src/queries/linodes/linodes';

import type { APIError, Linode } from '@linode/api-v4';

interface EnableBackupsFufilledResult extends PromiseFulfilledResult<{}> {
  linode: Linode;
}

export interface EnableBackupsRejectedResult extends PromiseRejectedResult {
  linode: Linode;
  reason: APIError[];
}

export const useEnableBackupsOnLinodesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    (EnableBackupsFufilledResult | EnableBackupsRejectedResult)[],
    unknown,
    Linode[]
  >({
    mutationFn: async (linodes) => {
      const data = await Promise.allSettled(
        linodes.map((linode) => enableBackups(linode.id))
      );
      return linodes.map((linode, idx) => ({ linode, ...data[idx] }));
    },
    onSuccess(_, variables) {
      queryClient.invalidateQueries(linodeQueries.linodes);
      for (const linode of variables) {
        queryClient.invalidateQueries({
          exact: true,
          queryKey: linodeQueries.linode(linode.id).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linode.id)._ctx.backups.queryKey,
        });
      }
    },
  });
};

interface FailureNotificationProps {
  failedCount: number;
  successCount: number;
}

export const getFailureNotificationText = ({
  failedCount,
  successCount,
}: FailureNotificationProps): string => {
  if (successCount > 0) {
    return `Enabled backups successfully for ${pluralize(
      'Linode',
      'Linodes',
      successCount
    )}, but ${pluralize('Linode', 'Linodes', failedCount)} failed.`;
  }
  // This function will only be called if at least one backup failed.
  return `There was an error enabling backups for your Linodes.`;
};

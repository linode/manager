import { enableBackups } from '@linode/api-v4';
import { useMutation, useQueryClient } from 'react-query';

import { queryKey } from 'src/queries/linodes/linodes';

import type { APIError, Linode, LinodeType } from '@linode/api-v4';

export const getTotalBackupsPrice = (
  linodes: Linode[],
  types: LinodeType[]
) => {
  return linodes.reduce((prevValue: number, linode: Linode) => {
    const type = types.find((type) => type.id === linode.type);
    return prevValue + (type?.addons.backups.price.monthly ?? 0);
  }, 0);
};

interface EnableBackupsFufilledResult extends PromiseFulfilledResult<{}> {
  linode: Linode;
  status: 'fulfilled';
}

export interface EnableBackupsRejectedResult extends PromiseRejectedResult {
  linode: Linode;
  reason: APIError[];
  status: 'rejected';
}

export const useEnableBackupsOnLinodesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    (EnableBackupsFufilledResult | EnableBackupsRejectedResult)[],
    unknown,
    Linode[]
  >(
    async (linodes) => {
      const data = await Promise.allSettled(
        linodes.map((linode) => enableBackups(linode.id))
      );
      return linodes.map((linode, idx) => ({ linode, ...data[idx] }));
    },
    {
      onSuccess(_, variables) {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.invalidateQueries([queryKey, 'all']);
        queryClient.invalidateQueries([queryKey, 'infinite']);
        for (const linode of variables) {
          queryClient.invalidateQueries([
            queryKey,
            'linode',
            linode.id,
            'details',
          ]);
          queryClient.invalidateQueries([
            queryKey,
            'linode',
            linode.id,
            'backups',
          ]);
        }
      },
    }
  );
};

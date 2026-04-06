import { startMutation } from '@linode/api-v4';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { linodeQueries } from './linodes';

import type { APIError } from '@linode/api-v4';

export const useStartLinodeMutationMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => startMutation(id),
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

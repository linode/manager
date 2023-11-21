import { APIError, startMutation } from '@linode/api-v4';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKey } from './linodes';

export const useStartLinodeMutationMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => startMutation(id), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
      queryClient.invalidateQueries([queryKey, 'linode', id, 'details']);
    },
  });
};

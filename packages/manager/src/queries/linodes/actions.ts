import { APIError, startMutation } from '@linode/api-v4';
import { useMutation, useQueryClient } from 'react-query';
import { queryKey } from './linodes';

export const useStartLinodeMutationMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => startMutation(id), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

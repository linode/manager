import { APIError, deleteLinodeConfig } from '@linode/api-v4';
import { useMutation, useQueryClient } from 'react-query';
import { queryKey } from './linodes';

export const useLinodeConfigDeleteMutation = (
  linodeId: number,
  configId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(
    () => deleteLinodeConfig(linodeId, configId),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          queryKey,
          'linode',
          linodeId,
          'configs',
        ]);
      },
    }
  );
};

import {
  APIError,
  Config,
  LinodeConfigCreationData,
  createLinodeConfig,
  deleteLinodeConfig,
  updateLinodeConfig,
} from '@linode/api-v4';
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

export const useLinodeConfigCreateMutation = (linodeId: number) => {
  const queryClient = useQueryClient();
  return useMutation<Config, APIError[], LinodeConfigCreationData>(
    (data) => createLinodeConfig(linodeId, data),
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

export const useLinodeConfigUpdateMutation = (
  linodeId: number,
  configId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<Config, APIError[], Partial<LinodeConfigCreationData>>(
    (data) => updateLinodeConfig(linodeId, configId, data),
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

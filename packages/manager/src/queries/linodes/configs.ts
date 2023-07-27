import {
  APIError,
  Config,
  LinodeConfigCreationData,
  createLinodeConfig,
  deleteLinodeConfig,
  getLinodeConfigs,
  updateLinodeConfig,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { getAll } from 'src/utilities/getAll';

import { queryKey } from './linodes';

export const useAllLinodeConfigsQuery = (id: number, enabled = true) => {
  return useQuery<Config[], APIError[]>(
    [queryKey, 'linode', id, 'configs'],
    () => getAllLinodeConfigs(id),
    { enabled }
  );
};

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

const getAllLinodeConfigs = (id: number) =>
  getAll<Config>((params, filter) =>
    getLinodeConfigs(id, params, filter)
  )().then((data) => data.data);

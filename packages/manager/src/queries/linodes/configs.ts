import {
  createLinodeConfig,
  deleteLinodeConfig,
  updateLinodeConfig,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { linodeQueries } from './linodes';

import type {
  APIError,
  Config,
  LinodeConfigCreationData,
} from '@linode/api-v4';

export const useAllLinodeConfigsQuery = (id: number, enabled = true) => {
  return useQuery<Config[], APIError[]>({
    ...linodeQueries.linode(id)._ctx.configs,
    enabled,
  });
};

export const useLinodeConfigDeleteMutation = (
  linodeId: number,
  configId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteLinodeConfig(linodeId, configId),
    onSuccess() {
      queryClient.invalidateQueries(
        linodeQueries.linode(linodeId)._ctx.configs
      );
    },
  });
};

export const useLinodeConfigCreateMutation = (linodeId: number) => {
  const queryClient = useQueryClient();
  return useMutation<Config, APIError[], LinodeConfigCreationData>({
    mutationFn: (data) => createLinodeConfig(linodeId, data),
    onSuccess() {
      queryClient.invalidateQueries(
        linodeQueries.linode(linodeId)._ctx.configs
      );
    },
  });
};

export const useLinodeConfigUpdateMutation = (
  linodeId: number,
  configId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<Config, APIError[], Partial<LinodeConfigCreationData>>({
    mutationFn: (data) => updateLinodeConfig(linodeId, configId, data),
    onSuccess() {
      queryClient.invalidateQueries(
        linodeQueries.linode(linodeId)._ctx.configs
      );
    },
  });
};

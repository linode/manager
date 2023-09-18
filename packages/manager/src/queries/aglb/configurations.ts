import {
  deleteLoadbalancerConfiguration,
  getLoadbalancerConfigurations,
  updateLoadbalancerConfiguration,
} from '@linode/api-v4';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import { QUERY_KEY } from './loadbalancers';

import type {
  APIError,
  Configuration,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4';

export const useLoadBalancerConfigurationsQuery = (
  loadbalancerId: number,
  params?: Params,
  filter?: Filter
) => {
  return useQuery<ResourcePage<Configuration>, APIError[]>(
    [QUERY_KEY, 'aglb', loadbalancerId, 'configurations', params, filter],
    () => getLoadbalancerConfigurations(loadbalancerId, params, filter),
    { keepPreviousData: true }
  );
};

export const useLoabalancerConfigurationsInfiniteQuery = (
  loadbalancerId: number
) => {
  return useInfiniteQuery<ResourcePage<Configuration>, APIError[]>(
    [QUERY_KEY, 'aglb', loadbalancerId, 'configurations', 'infinite'],
    ({ pageParam }) =>
      getLoadbalancerConfigurations(loadbalancerId, {
        page: pageParam,
        page_size: 25,
      }),
    {
      getNextPageParam: ({ page, pages }) => {
        if (page === pages) {
          return undefined;
        }
        return page + 1;
      },
    }
  );
};

export const useLoadBalancerConfigurationMutation = (
  loadbalancerId: number,
  configurationId: number
) => {
  const queryClient = useQueryClient();

  return useMutation<Configuration, APIError[], Partial<Configuration>>(
    (data) =>
      updateLoadbalancerConfiguration(loadbalancerId, configurationId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          QUERY_KEY,
          'aglb',
          loadbalancerId,
          'configurations',
        ]);
      },
    }
  );
};

export const useLoadBalancerConfigurationDeleteMutation = (
  loadbalancerId: number,
  configurationId: number
) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>(
    () => deleteLoadbalancerConfiguration(loadbalancerId, configurationId),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          QUERY_KEY,
          'aglb',
          loadbalancerId,
          'configurations',
        ]);
      },
    }
  );
};

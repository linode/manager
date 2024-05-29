import {
  createLoadbalancerConfiguration,
  deleteLoadbalancerConfiguration,
  getLoadbalancerConfigurations,
  getLoadbalancerConfigurationsEndpointHealth,
  updateLoadbalancerConfiguration,
} from '@linode/api-v4';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { FormattedAPIError } from 'src/types/FormattedAPIError';

import { QUERY_KEY } from './loadbalancers';

import type {
  Configuration,
  ConfigurationPayload,
  ConfigurationsEndpointHealth,
  Filter,
  Params,
  ResourcePage,
  UpdateConfigurationPayload,
} from '@linode/api-v4';

export const useLoadBalancerConfigurationsQuery = (
  loadbalancerId: number,
  params?: Params,
  filter?: Filter
) => {
  return useQuery<ResourcePage<Configuration>, FormattedAPIError[]>(
    [QUERY_KEY, 'aclb', loadbalancerId, 'configurations', params, filter],
    () => getLoadbalancerConfigurations(loadbalancerId, params, filter),
    { keepPreviousData: true }
  );
};

export const useLoadBalancerConfigurationsEndpointsHealth = (
  loadbalancerId: number
) => {
  return useQuery<ConfigurationsEndpointHealth, FormattedAPIError[]>({
    queryFn: () => getLoadbalancerConfigurationsEndpointHealth(loadbalancerId),
    queryKey: [
      QUERY_KEY,
      'aclb',
      loadbalancerId,
      'configurations',
      'endpoint-health',
    ],
    refetchInterval: 10_000,
  });
};

export const useLoabalancerConfigurationsInfiniteQuery = (
  loadbalancerId: number
) => {
  return useInfiniteQuery<ResourcePage<Configuration>, FormattedAPIError[]>(
    [QUERY_KEY, 'aclb', loadbalancerId, 'configurations', 'infinite'],
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

  return useMutation<
    Configuration,
    FormattedAPIError[],
    UpdateConfigurationPayload
  >(
    (data) =>
      updateLoadbalancerConfiguration(loadbalancerId, configurationId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          QUERY_KEY,
          'aclb',
          loadbalancerId,
          'configurations',
        ]);
        // The GET /v4/aclb endpoint also returns configuration data that we must update
        queryClient.invalidateQueries([QUERY_KEY, 'paginated']);
        queryClient.invalidateQueries([QUERY_KEY, 'aclb', loadbalancerId]);
      },
    }
  );
};

export const useLoadBalancerConfigurationCreateMutation = (
  loadbalancerId: number
) => {
  const queryClient = useQueryClient();

  return useMutation<Configuration, FormattedAPIError[], ConfigurationPayload>(
    (data) => createLoadbalancerConfiguration(loadbalancerId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          QUERY_KEY,
          'aclb',
          loadbalancerId,
          'configurations',
        ]);
        // The GET /v4/aclb endpoint also returns configuration data that we must update
        queryClient.invalidateQueries([QUERY_KEY, 'paginated']);
        queryClient.invalidateQueries([QUERY_KEY, 'aclb', loadbalancerId]);
      },
    }
  );
};

export const useLoadBalancerConfigurationDeleteMutation = (
  loadbalancerId: number,
  configurationId: number
) => {
  const queryClient = useQueryClient();

  return useMutation<{}, FormattedAPIError[]>(
    () => deleteLoadbalancerConfiguration(loadbalancerId, configurationId),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          QUERY_KEY,
          'aclb',
          loadbalancerId,
          'configurations',
        ]);
        // The GET /v4/aclb endpoint also returns configuration data that we must update
        queryClient.invalidateQueries([QUERY_KEY, 'paginated']);
        queryClient.invalidateQueries([QUERY_KEY, 'aclb', loadbalancerId]);
      },
    }
  );
};

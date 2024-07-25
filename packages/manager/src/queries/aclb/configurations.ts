import {
  createLoadbalancerConfiguration,
  deleteLoadbalancerConfiguration,
  updateLoadbalancerConfiguration,
} from '@linode/api-v4';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { aclbQueries } from './queries';

import type {
  APIError,
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
  return useQuery<ResourcePage<Configuration>, APIError[]>({
    ...aclbQueries
      .loadbalancer(loadbalancerId)
      ._ctx.configurations._ctx.lists._ctx.paginated(params, filter),
    keepPreviousData: true,
  });
};

export const useLoadBalancerConfigurationsEndpointsHealth = (
  loadbalancerId: number
) => {
  return useQuery<ConfigurationsEndpointHealth, APIError[]>({
    ...aclbQueries.loadbalancer(loadbalancerId)._ctx.configurations._ctx
      .endpointHealth,
    refetchInterval: 10_000,
  });
};

export const useLoabalancerConfigurationsInfiniteQuery = (
  loadbalancerId: number
) => {
  return useInfiniteQuery<ResourcePage<Configuration>, APIError[]>({
    ...aclbQueries.loadbalancer(loadbalancerId)._ctx.configurations._ctx.lists
      ._ctx.infinite,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
  });
};

export const useLoadBalancerConfigurationMutation = (
  loadbalancerId: number,
  configurationId: number
) => {
  const queryClient = useQueryClient();

  return useMutation<Configuration, APIError[], UpdateConfigurationPayload>({
    mutationFn: (data) =>
      updateLoadbalancerConfiguration(loadbalancerId, configurationId, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: aclbQueries.loadbalancer(loadbalancerId)._ctx.configurations
          ._ctx.lists.queryKey,
      });
      // The GET /v4/aclb endpoint also returns configuration data that we must update
      // the paginated list and the ACLB object
      queryClient.invalidateQueries({ queryKey: aclbQueries.paginated._def });
      queryClient.invalidateQueries({
        exact: true,
        queryKey: aclbQueries.loadbalancer(loadbalancerId).queryKey,
      });
    },
  });
};

export const useLoadBalancerConfigurationCreateMutation = (
  loadbalancerId: number
) => {
  const queryClient = useQueryClient();

  return useMutation<Configuration, APIError[], ConfigurationPayload>({
    mutationFn: (data) => createLoadbalancerConfiguration(loadbalancerId, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: aclbQueries.loadbalancer(loadbalancerId)._ctx.configurations
          ._ctx.lists.queryKey,
      });
      // The GET /v4/aclb endpoint also returns configuration data that we must update
      // the paginated list and the ACLB object
      queryClient.invalidateQueries({ queryKey: aclbQueries.paginated._def });
      queryClient.invalidateQueries({
        exact: true,
        queryKey: aclbQueries.loadbalancer(loadbalancerId).queryKey,
      });
    },
  });
};

export const useLoadBalancerConfigurationDeleteMutation = (
  loadbalancerId: number,
  configurationId: number
) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>({
    mutationFn: () =>
      deleteLoadbalancerConfiguration(loadbalancerId, configurationId),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: aclbQueries.loadbalancer(loadbalancerId)._ctx.configurations
          ._ctx.lists.queryKey,
      });
      // The GET /v4/aclb endpoint also returns configuration data that we must update
      // the paginated list and the ACLB object
      queryClient.invalidateQueries({ queryKey: aclbQueries.paginated._def });
      queryClient.invalidateQueries({
        exact: true,
        queryKey: aclbQueries.loadbalancer(loadbalancerId).queryKey,
      });
    },
  });
};

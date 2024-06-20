import {
  createLoadbalancerServiceTarget,
  deleteLoadbalancerServiceTarget,
  updateLoadbalancerServiceTarget,
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
  Filter,
  Params,
  ResourcePage,
  ServiceTarget,
  ServiceTargetPayload,
  ServiceTargetsEndpointHealth,
} from '@linode/api-v4';

export const useLoadBalancerServiceTargetsQuery = (
  loadbalancerId: number,
  params: Params,
  filter: Filter
) => {
  return useQuery<ResourcePage<ServiceTarget>, APIError[]>({
    ...aclbQueries
      .loadbalancer(loadbalancerId)
      ._ctx.serviceTargets._ctx.lists._ctx.paginated(params, filter),
    keepPreviousData: true,
  });
};

export const useLoadBalancerServiceTargetsEndpointHealthQuery = (
  loadbalancerId: number
) => {
  return useQuery<ServiceTargetsEndpointHealth, APIError[]>({
    ...aclbQueries.loadbalancer(loadbalancerId)._ctx.serviceTargets._ctx
      .endpointHealth,
    refetchInterval: 10_000,
  });
};

export const useServiceTargetCreateMutation = (loadbalancerId: number) => {
  const queryClient = useQueryClient();
  return useMutation<ServiceTarget, APIError[], ServiceTargetPayload>({
    mutationFn: (data) => createLoadbalancerServiceTarget(loadbalancerId, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: aclbQueries.loadbalancer(loadbalancerId)._ctx.serviceTargets
          ._ctx.lists.queryKey,
      });
    },
  });
};

export const useServiceTargetUpdateMutation = (
  loadbalancerId: number,
  serviceTargetId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<ServiceTarget, APIError[], ServiceTargetPayload>({
    mutationFn: (data) =>
      updateLoadbalancerServiceTarget(loadbalancerId, serviceTargetId, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: aclbQueries.loadbalancer(loadbalancerId)._ctx.serviceTargets
          ._ctx.lists.queryKey,
      });
    },
  });
};

export const useLoadBalancerServiceTargetDeleteMutation = (
  loadbalancerId: number,
  serviceTargetId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () =>
      deleteLoadbalancerServiceTarget(loadbalancerId, serviceTargetId),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: aclbQueries.loadbalancer(loadbalancerId)._ctx.serviceTargets
          ._ctx.lists.queryKey,
      });
    },
  });
};

export const useLoadBalancerServiceTargetsInfiniteQuery = (
  id: number,
  filter: Filter = {}
) => {
  return useInfiniteQuery<ResourcePage<ServiceTarget>, APIError[]>({
    ...aclbQueries
      .loadbalancer(id)
      ._ctx.serviceTargets._ctx.lists._ctx.infinite(filter),
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
  });
};

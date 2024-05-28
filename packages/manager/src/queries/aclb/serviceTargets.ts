import {
  createLoadbalancerServiceTarget,
  deleteLoadbalancerServiceTarget,
  getLoadbalancerServiceTargets,
  getServiceTargetsEndpointHealth,
  updateLoadbalancerServiceTarget,
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
  return useQuery<ResourcePage<ServiceTarget>, FormattedAPIError[]>(
    [QUERY_KEY, 'aclb', loadbalancerId, 'service-targets', params, filter],
    () => getLoadbalancerServiceTargets(loadbalancerId, params, filter),
    { keepPreviousData: true }
  );
};

export const useLoadBalancerServiceTargetsEndpointHealthQuery = (
  loadbalancerId: number
) => {
  return useQuery<ServiceTargetsEndpointHealth, FormattedAPIError[]>({
    queryFn: () => getServiceTargetsEndpointHealth(loadbalancerId),
    queryKey: [
      QUERY_KEY,
      'aclb',
      loadbalancerId,
      'service-targets',
      'endpoint-health',
    ],
    refetchInterval: 10_000,
  });
};

export const useServiceTargetCreateMutation = (loadbalancerId: number) => {
  const queryClient = useQueryClient();
  return useMutation<ServiceTarget, FormattedAPIError[], ServiceTargetPayload>(
    (data) => createLoadbalancerServiceTarget(loadbalancerId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          QUERY_KEY,
          'aclb',
          loadbalancerId,
          'service-targets',
        ]);
      },
    }
  );
};

export const useServiceTargetUpdateMutation = (
  loadbalancerId: number,
  serviceTargetId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<ServiceTarget, FormattedAPIError[], ServiceTargetPayload>(
    (data) =>
      updateLoadbalancerServiceTarget(loadbalancerId, serviceTargetId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          QUERY_KEY,
          'aclb',
          loadbalancerId,
          'service-targets',
        ]);
      },
    }
  );
};

export const useLoadBalancerServiceTargetDeleteMutation = (
  loadbalancerId: number,
  serviceTargetId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>(
    () => deleteLoadbalancerServiceTarget(loadbalancerId, serviceTargetId),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          QUERY_KEY,
          'aclb',
          loadbalancerId,
          'service-targets',
        ]);
      },
    }
  );
};

export const useLoadBalancerServiceTargetsInfiniteQuery = (
  id: number,
  filter: Filter = {}
) => {
  return useInfiniteQuery<ResourcePage<ServiceTarget>, FormattedAPIError[]>(
    [QUERY_KEY, 'aclb', id, 'service-targets', 'infinite', filter],
    ({ pageParam }) =>
      getLoadbalancerServiceTargets(
        id,
        { page: pageParam, page_size: 25 },
        filter
      ),
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

import {
  createBasicLoadbalancer,
  createLoadbalancer,
  deleteLoadbalancer,
  getLoadbalancer,
  getLoadbalancerEndpointHealth,
  getLoadbalancers,
  updateLoadbalancer,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import type {
  APIError,
  CreateBasicLoadbalancerPayload,
  CreateLoadbalancerPayload,
  Filter,
  LoadBalancerEndpointHealth,
  Loadbalancer,
  Params,
  ResourcePage,
  UpdateLoadbalancerPayload,
} from '@linode/api-v4';

export const QUERY_KEY = 'aclbs';

export const useLoadBalancersQuery = (params?: Params, filter?: Filter) => {
  return useQuery<ResourcePage<Loadbalancer>, APIError[]>(
    [QUERY_KEY, 'paginated', params, filter],
    () => getLoadbalancers(params, filter),
    { keepPreviousData: true }
  );
};

export const useLoadBalancerQuery = (id: number, enabled = true) => {
  return useQuery<Loadbalancer, APIError[]>(
    [QUERY_KEY, 'aclb', id],
    () => getLoadbalancer(id),
    { enabled }
  );
};

export const useLoadBalancerEndpointHealthQuery = (id: number) => {
  return useQuery<LoadBalancerEndpointHealth, APIError[]>({
    queryFn: () => getLoadbalancerEndpointHealth(id),
    queryKey: [QUERY_KEY, 'aclb', id, 'endpoint-health'],
    refetchInterval: 10_000,
  });
};

export const useLoadBalancerMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Loadbalancer, APIError[], UpdateLoadbalancerPayload>(
    (data) => updateLoadbalancer(id, data),
    {
      onSuccess(data) {
        queryClient.setQueryData([QUERY_KEY, 'aclb', id], data);
        queryClient.invalidateQueries([QUERY_KEY, 'paginated']);
      },
    }
  );
};

export const useLoadBalancerBasicCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Loadbalancer, APIError[], CreateBasicLoadbalancerPayload>(
    (data) => createBasicLoadbalancer(data),
    {
      onSuccess(data) {
        queryClient.setQueryData([QUERY_KEY, 'aclb', data.id], data);
        queryClient.invalidateQueries([QUERY_KEY, 'paginated']);
      },
    }
  );
};

export const useLoadBalancerCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Loadbalancer, APIError[], CreateLoadbalancerPayload>({
    mutationFn: createLoadbalancer,
    onSuccess(data) {
      queryClient.setQueryData([QUERY_KEY, 'aclb', data.id], data);
      queryClient.invalidateQueries([QUERY_KEY, 'paginated']);
    },
  });
};

export const useLoadBalancerDeleteMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteLoadbalancer(id), {
    onSuccess() {
      queryClient.removeQueries([QUERY_KEY, 'aclb', id]);
      queryClient.invalidateQueries([QUERY_KEY, 'paginated']);
    },
  });
};

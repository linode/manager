import {
  createBasicLoadbalancer,
  createLoadbalancer,
  deleteLoadbalancer,
  getLoadbalancer,
  getLoadbalancerEndpointHealth,
  getLoadbalancers,
  updateLoadbalancer,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateBasicLoadbalancerPayload,
  CreateLoadbalancerPayload,
  Filter,
  LoadBalancerEndpointHealth,
  Loadbalancer,
  Params,
  ResourcePage,
  UpdateLoadbalancerPayload,
} from '@linode/api-v4';
import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const QUERY_KEY = 'aclbs';

export const useLoadBalancersQuery = (params?: Params, filter?: Filter) => {
  return useQuery<ResourcePage<Loadbalancer>, FormattedAPIError[]>(
    [QUERY_KEY, 'paginated', params, filter],
    () => getLoadbalancers(params, filter),
    { keepPreviousData: true }
  );
};

export const useLoadBalancerQuery = (id: number, enabled = true) => {
  return useQuery<Loadbalancer, FormattedAPIError[]>(
    [QUERY_KEY, 'aclb', id],
    () => getLoadbalancer(id),
    { enabled }
  );
};

export const useLoadBalancerEndpointHealthQuery = (id: number) => {
  return useQuery<LoadBalancerEndpointHealth, FormattedAPIError[]>({
    queryFn: () => getLoadbalancerEndpointHealth(id),
    queryKey: [QUERY_KEY, 'aclb', id, 'endpoint-health'],
    refetchInterval: 10_000,
  });
};

export const useLoadBalancerMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    Loadbalancer,
    FormattedAPIError[],
    UpdateLoadbalancerPayload
  >((data) => updateLoadbalancer(id, data), {
    onSuccess(data) {
      queryClient.setQueryData([QUERY_KEY, 'aclb', id], data);
      queryClient.invalidateQueries([QUERY_KEY, 'paginated']);
    },
  });
};

export const useLoadBalancerBasicCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Loadbalancer,
    FormattedAPIError[],
    CreateBasicLoadbalancerPayload
  >((data) => createBasicLoadbalancer(data), {
    onSuccess(data) {
      queryClient.setQueryData([QUERY_KEY, 'aclb', data.id], data);
      queryClient.invalidateQueries([QUERY_KEY, 'paginated']);
    },
  });
};

export const useLoadBalancerCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Loadbalancer,
    FormattedAPIError[],
    CreateLoadbalancerPayload
  >({
    mutationFn: createLoadbalancer,
    onSuccess(data) {
      queryClient.setQueryData([QUERY_KEY, 'aclb', data.id], data);
      queryClient.invalidateQueries([QUERY_KEY, 'paginated']);
    },
  });
};

export const useLoadBalancerDeleteMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>(() => deleteLoadbalancer(id), {
    onSuccess() {
      queryClient.removeQueries([QUERY_KEY, 'aclb', id]);
      queryClient.invalidateQueries([QUERY_KEY, 'paginated']);
    },
  });
};

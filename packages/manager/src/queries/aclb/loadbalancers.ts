import {
  createBasicLoadbalancer,
  createLoadbalancer,
  deleteLoadbalancer,
  updateLoadbalancer,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { aclbQueries } from './queries';

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

export const useLoadBalancersQuery = (params?: Params, filter?: Filter) => {
  return useQuery<ResourcePage<Loadbalancer>, APIError[]>({
    ...aclbQueries.paginated(params, filter),
    keepPreviousData: true,
  });
};

export const useLoadBalancerQuery = (id: number, enabled = true) => {
  return useQuery<Loadbalancer, APIError[]>({
    ...aclbQueries.loadbalancer(id),
    enabled,
  });
};

export const useLoadBalancerEndpointHealthQuery = (id: number) => {
  return useQuery<LoadBalancerEndpointHealth, APIError[]>({
    ...aclbQueries.loadbalancer(id)._ctx.endpointHealth,
    refetchInterval: 10_000,
  });
};

export const useLoadBalancerMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Loadbalancer, APIError[], UpdateLoadbalancerPayload>({
    mutationFn: (data) => updateLoadbalancer(id, data),
    onSuccess(loadbalancer) {
      queryClient.setQueryData<Loadbalancer>(
        aclbQueries.loadbalancer(id).queryKey,
        loadbalancer
      );
      queryClient.invalidateQueries({
        queryKey: aclbQueries.paginated._def,
      });
    },
  });
};

export const useLoadBalancerBasicCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Loadbalancer, APIError[], CreateBasicLoadbalancerPayload>({
    mutationFn: createBasicLoadbalancer,
    onSuccess(loadbalancer) {
      queryClient.setQueryData<Loadbalancer>(
        aclbQueries.loadbalancer(loadbalancer.id).queryKey,
        loadbalancer
      );
      queryClient.invalidateQueries({
        queryKey: aclbQueries.paginated._def,
      });
    },
  });
};

export const useLoadBalancerCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Loadbalancer, APIError[], CreateLoadbalancerPayload>({
    mutationFn: createLoadbalancer,
    onSuccess(loadbalancer) {
      queryClient.setQueryData<Loadbalancer>(
        aclbQueries.loadbalancer(loadbalancer.id).queryKey,
        loadbalancer
      );
      queryClient.invalidateQueries({
        queryKey: aclbQueries.paginated._def,
      });
    },
  });
};

export const useLoadBalancerDeleteMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteLoadbalancer(id), {
    onSuccess() {
      queryClient.removeQueries({
        queryKey: aclbQueries.loadbalancer(id).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: aclbQueries.paginated._def,
      });
    },
  });
};

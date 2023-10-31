import {
  createBasicLoadbalancer,
  deleteLoadbalancer,
  getLoadbalancer,
  getLoadbalancers,
  updateLoadbalancer,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import type {
  APIError,
  CreateBasicLoadbalancerPayload,
  Filter,
  Loadbalancer,
  Params,
  ResourcePage,
  UpdateLoadbalancerPayload,
} from '@linode/api-v4';

export const QUERY_KEY = 'aglbs';

export const useLoadBalancersQuery = (params?: Params, filter?: Filter) => {
  return useQuery<ResourcePage<Loadbalancer>, APIError[]>(
    [QUERY_KEY, 'paginated', params, filter],
    () => getLoadbalancers(params, filter),
    { keepPreviousData: true }
  );
};

export const useLoadBalancerQuery = (id: number, enabled = true) => {
  return useQuery<Loadbalancer, APIError[]>(
    [QUERY_KEY, 'aglb', id],
    () => getLoadbalancer(id),
    { enabled }
  );
};

export const useLoadBalancerMutation = (id: number) => {
  const queryCleint = useQueryClient();
  return useMutation<Loadbalancer, APIError[], UpdateLoadbalancerPayload>(
    (data) => updateLoadbalancer(id, data),
    {
      onSuccess(data) {
        queryCleint.setQueryData([QUERY_KEY, 'aglb', id], data);
      },
    }
  );
};

export const useLoadBalancerBasicCreateMutation = () => {
  const queryCleint = useQueryClient();
  return useMutation<Loadbalancer, APIError[], CreateBasicLoadbalancerPayload>(
    (data) => createBasicLoadbalancer(data),
    {
      onSuccess(data) {
        queryCleint.setQueryData([QUERY_KEY, 'aglb', data.id], data);
      },
    }
  );
};

export const useLoadBalancerDeleteMutation = (id: number) => {
  const queryCleint = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteLoadbalancer(id), {
    onSuccess() {
      queryCleint.removeQueries([QUERY_KEY, 'aglb', id]);
    },
  });
};

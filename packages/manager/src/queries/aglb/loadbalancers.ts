import { getLoadbalancer, getLoadbalancers } from '@linode/api-v4';
import { useQuery } from 'react-query';

import type {
  APIError,
  Filter,
  Loadbalancer,
  Params,
  ResourcePage,
} from '@linode/api-v4';

export const QUERY_KEY = 'aglbs';

export const useLoadBalancersQuery = (params?: Params, filter?: Filter) => {
  return useQuery<ResourcePage<Loadbalancer>, APIError[]>(
    [QUERY_KEY, 'paginated', params, filter],
    () => getLoadbalancers(params, filter),
    { keepPreviousData: true }
  );
};

export const useLoadBalancerQuery = (id: number) => {
  return useQuery<Loadbalancer, APIError[]>([QUERY_KEY, 'aglb', id], () =>
    getLoadbalancer(id)
  );
};

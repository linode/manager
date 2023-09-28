import { getLoadbalancerRoutes } from '@linode/api-v4';
import { useQuery } from 'react-query';

import { QUERY_KEY } from './loadbalancers';

import type {
  APIError,
  Filter,
  Params,
  ResourcePage,
  Route,
} from '@linode/api-v4';

export const useLoadBalancerRoutesQuery = (
  id: number,
  params: Params,
  filter: Filter
) => {
  return useQuery<ResourcePage<Route>, APIError[]>(
    [QUERY_KEY, 'loadbalancer', id, 'routes', params, filter],
    () => getLoadbalancerRoutes(id, params, filter),
    { keepPreviousData: true }
  );
};

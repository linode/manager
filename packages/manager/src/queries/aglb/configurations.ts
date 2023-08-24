import { getLoadbalancerConfigurations } from '@linode/api-v4';
import { useInfiniteQuery, useQuery } from 'react-query';

import { QUERY_KEY } from './loadbalancers';

import type {
  APIError,
  Configuration,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4';

export const useLoadBalancerConfigurationsQuery = (
  loadbalancerId: number,
  params?: Params,
  filter?: Filter
) => {
  return useQuery<ResourcePage<Configuration>, APIError[]>(
    [QUERY_KEY, 'aglb', loadbalancerId, 'configurations', params, filter],
    () => getLoadbalancerConfigurations(loadbalancerId, params, filter),
    { keepPreviousData: true }
  );
};

export const useLoabalancerConfigurationsInfiniteQuery = (
  loadbalancerId: number
) => {
  return useInfiniteQuery<ResourcePage<Configuration>, APIError[]>(
    [QUERY_KEY, 'aglb', loadbalancerId, 'configurations', 'infinite'],
    ({ pageParam }) =>
      getLoadbalancerConfigurations(loadbalancerId, {
        page: pageParam,
        page_size: 25,
      })
  );
};

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

import { networkLoadBalancerQueries } from './keys';

import type {
  APIError,
  Filter,
  NetworkLoadBalancer,
  Params,
  ResourcePage,
} from '@linode/api-v4';

/**
 * useNetworkLoadBalancersQuery
 *
 * Returns a paginated list of Network Load Balancers
 */
export const useNetworkLoadBalancersQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<NetworkLoadBalancer>, APIError[]>({
    ...networkLoadBalancerQueries.netloadbalancers._ctx.paginated(
      params,
      filter,
    ),
    placeholderData: keepPreviousData,
  });

/**
 * useAllNetworkLoadBalancersQuery
 *
 * Returns all Network Load Balancers (not paginated)
 * Please use sparingly - prefer paginated queries when possible
 */
export const useAllNetworkLoadBalancersQuery = (
  enabled: boolean = true,
  params: Params = {},
  filter: Filter = {},
) =>
  useQuery<NetworkLoadBalancer[], APIError[]>({
    ...networkLoadBalancerQueries.netloadbalancers._ctx.all(params, filter),
    enabled,
  });

/**
 * useNetworkLoadBalancerQuery
 *
 * Returns a single Network Load Balancer by ID
 */
export const useNetworkLoadBalancerQuery = (
  id: number,
  enabled: boolean = true,
) => {
  return useQuery<NetworkLoadBalancer, APIError[]>({
    ...networkLoadBalancerQueries.netloadbalancer(id),
    enabled,
  });
};

/**
 * useInfiniteNetworkLoadBalancersQuery
 *
 * Returns an infinite query for Network Load Balancers
 */
export const useInfiniteNetworkLoadBalancersQuery = (
  filter: Filter,
  enabled: boolean = true,
) =>
  useInfiniteQuery<ResourcePage<NetworkLoadBalancer>, APIError[]>({
    ...networkLoadBalancerQueries.netloadbalancers._ctx.infinite(filter),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    retry: false,
  });

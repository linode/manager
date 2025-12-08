import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { networkLoadBalancerQueries } from './keys';

import type {
  APIError,
  Filter,
  NetworkLoadBalancerListener,
  Params,
  ResourcePage,
} from '@linode/api-v4';

/**
 * useNetworkLoadBalancerListenersQuery
 *
 * Returns a paginated list of listeners for a Network Load Balancer
 */
export const useNetworkLoadBalancerListenersQuery = (
  networkLoadBalancerId: number,
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true,
) =>
  useQuery<ResourcePage<NetworkLoadBalancerListener>, APIError[]>({
    ...networkLoadBalancerQueries
      .netloadbalancer(networkLoadBalancerId)
      ._ctx.listeners._ctx.paginated(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });

/**
 * useNetworkLoadBalancerListenerQuery
 *
 * Returns a single listener by ID for a Network Load Balancer
 */
export const useNetworkLoadBalancerListenerQuery = (
  networkLoadBalancerId: number,
  listenerId: number,
  enabled: boolean = true,
) => {
  return useQuery<NetworkLoadBalancerListener, APIError[]>({
    ...networkLoadBalancerQueries
      .netloadbalancer(networkLoadBalancerId)
      ._ctx.listener(listenerId),
    enabled,
  });
};

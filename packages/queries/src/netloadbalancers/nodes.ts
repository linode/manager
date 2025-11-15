import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { networkLoadBalancerQueries } from './keys';

import type {
  APIError,
  Filter,
  NetworkLoadBalancerNode,
  Params,
  ResourcePage,
} from '@linode/api-v4';

/**
 * useNetworkLoadBalancerNodesQuery
 *
 * Returns a paginated list of nodes for a Network Load Balancer listener
 */
export const useNetworkLoadBalancerNodesQuery = (
  networkLoadBalancerId: number,
  listenerId: number,
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true,
) =>
  useQuery<ResourcePage<NetworkLoadBalancerNode>, APIError[]>({
    ...networkLoadBalancerQueries
      .netloadbalancer(networkLoadBalancerId)
      ._ctx.listener(listenerId)
      ._ctx.nodes._ctx.paginated(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });

/**
 * useNetworkLoadBalancerNodeQuery
 *
 * Returns a single node by ID for a Network Load Balancer listener
 */
export const useNetworkLoadBalancerNodeQuery = (
  networkLoadBalancerId: number,
  listenerId: number,
  nodeId: number,
  enabled: boolean = true,
) => {
  return useQuery<NetworkLoadBalancerNode, APIError[]>({
    ...networkLoadBalancerQueries
      .netloadbalancer(networkLoadBalancerId)
      ._ctx.listener(listenerId)
      ._ctx.node(nodeId),
    enabled,
  });
};

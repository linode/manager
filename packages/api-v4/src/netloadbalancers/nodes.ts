import { BETA_API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type { NetworkLoadBalancerNode } from './types';

/**
 * getNetworkLoadBalancerNodes
 *
 * Returns a paginated list of nodes for a listener.
 *
 * @param networkLoadBalancerId { number } The ID of the Network Load Balancer.
 * @param listenerId { number } The ID of the listener.
 */
interface GetNetworkLoadBalancerNodesOptions {
  filters?: Filter;
  listenerId: number;
  networkLoadBalancerId: number;
  params?: Params;
}

export const getNetworkLoadBalancerNodes = ({
  networkLoadBalancerId,
  listenerId,
  params,
  filters,
}: GetNetworkLoadBalancerNodesOptions) =>
  Request<Page<NetworkLoadBalancerNode>>(
    setURL(
      `${BETA_API_ROOT}/netloadbalancers/${encodeURIComponent(networkLoadBalancerId)}/listeners/${encodeURIComponent(listenerId)}/nodes`,
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );

/**
 * getNetworkLoadBalancerNode
 *
 * Returns detailed information about a single node.
 *
 * @param networkLoadBalancerId { number } The ID of the Network Load Balancer.
 * @param listenerId { number } The ID of the listener.
 * @param nodeId { number } The ID of the node to retrieve.
 */
interface GetNetworkLoadBalancerNodeOptions {
  listenerId: number;
  networkLoadBalancerId: number;
  nodeId: number;
}

export const getNetworkLoadBalancerNode = ({
  listenerId,
  networkLoadBalancerId,
  nodeId,
}: GetNetworkLoadBalancerNodeOptions) =>
  Request<NetworkLoadBalancerNode>(
    setURL(
      `${BETA_API_ROOT}/netloadbalancers/${encodeURIComponent(networkLoadBalancerId)}/listeners/${encodeURIComponent(listenerId)}/nodes/${encodeURIComponent(nodeId)}`,
    ),
    setMethod('GET'),
  );

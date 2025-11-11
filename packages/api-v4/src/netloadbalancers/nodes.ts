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
export const getNetworkLoadBalancerNodes = (
  networkLoadBalancerId: number,
  listenerId: number,
  params?: Params,
  filters?: Filter,
) =>
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
export const getNetworkLoadBalancerNode = (
  networkLoadBalancerId: number,
  listenerId: number,
  nodeId: number,
) =>
  Request<NetworkLoadBalancerNode>(
    setURL(
      `${BETA_API_ROOT}/netloadbalancers/${encodeURIComponent(networkLoadBalancerId)}/listeners/${encodeURIComponent(listenerId)}/nodes/${encodeURIComponent(nodeId)}`,
    ),
    setMethod('GET'),
  );

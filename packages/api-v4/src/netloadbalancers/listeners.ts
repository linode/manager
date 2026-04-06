import { BETA_API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type { NetworkLoadBalancerListener } from './types';

/**
 * getNetworkLoadBalancerListeners
 *
 * Returns a paginated list of listeners for a Network Load Balancer.
 *
 * @param networkLoadBalancerId { number } The ID of the Network Load Balancer.
 */
export const getNetworkLoadBalancerListeners = (
  networkLoadBalancerId: number,
  params?: Params,
  filters?: Filter,
) =>
  Request<Page<NetworkLoadBalancerListener>>(
    setURL(
      `${BETA_API_ROOT}/netloadbalancers/${encodeURIComponent(networkLoadBalancerId)}/listeners`,
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );

/**
 * getNetworkLoadBalancerListener
 *
 * Returns detailed information about a single listener.
 *
 * @param networkLoadBalancerId { number } The ID of the Network Load Balancer.
 * @param listenerId { number } The ID of the listener to retrieve.
 */
export const getNetworkLoadBalancerListener = (
  networkLoadBalancerId: number,
  listenerId: number,
) =>
  Request<NetworkLoadBalancerListener>(
    setURL(
      `${BETA_API_ROOT}/netloadbalancers/${encodeURIComponent(networkLoadBalancerId)}/listeners/${encodeURIComponent(listenerId)}`,
    ),
    setMethod('GET'),
  );

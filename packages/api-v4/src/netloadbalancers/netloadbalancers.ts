import { BETA_API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type { NetworkLoadBalancer } from './types';

/**
 * getNetworkLoadBalancers
 *
 * Returns a paginated list of Network Load Balancers on your account.
 */
export const getNetworkLoadBalancers = (params?: Params, filters?: Filter) =>
  Request<Page<NetworkLoadBalancer>>(
    setURL(`${BETA_API_ROOT}/netloadbalancers`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );

/**
 * getNetworkLoadBalancer
 *
 * Returns detailed information about a single Network Load Balancer.
 *
 * @param networkLoadBalancerId { number } The ID of the Network Load Balancer to retrieve.
 */
export const getNetworkLoadBalancer = (networkLoadBalancerId: number) =>
  Request<NetworkLoadBalancer>(
    setURL(
      `${BETA_API_ROOT}/netloadbalancers/${encodeURIComponent(networkLoadBalancerId)}`,
    ),
    setMethod('GET'),
  );

import {
  getNetworkLoadBalancerListeners,
  getNetworkLoadBalancerNodes,
  getNetworkLoadBalancers,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type {
  Filter,
  NetworkLoadBalancer,
  NetworkLoadBalancerListener,
  NetworkLoadBalancerNode,
  Params,
} from '@linode/api-v4';

export const getAllNetworkLoadBalancers = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<NetworkLoadBalancer>((params, filter) =>
    getNetworkLoadBalancers(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);

export const getAllNetworkLoadBalancerListeners = (
  networkLoadBalancerId: number,
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<NetworkLoadBalancerListener>((params, filter) =>
    getNetworkLoadBalancerListeners(
      networkLoadBalancerId,
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);

export const getAllNetworkLoadBalancerNodes = (
  networkLoadBalancerId: number,
  listenerId: number,
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<NetworkLoadBalancerNode>((params, filter) =>
    getNetworkLoadBalancerNodes(
      networkLoadBalancerId,
      listenerId,
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);

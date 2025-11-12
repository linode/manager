import {
  getNetworkLoadBalancer,
  getNetworkLoadBalancerListener,
  getNetworkLoadBalancerListeners,
  getNetworkLoadBalancerNode,
  getNetworkLoadBalancerNodes,
  getNetworkLoadBalancers,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import {
  getAllNetworkLoadBalancerListeners,
  getAllNetworkLoadBalancerNodes,
  getAllNetworkLoadBalancers,
} from './requests';

import type { Filter, Params } from '@linode/api-v4';

export const networkLoadBalancerQueries = createQueryKeys('netloadbalancers', {
  netloadbalancer: (id: number) => ({
    contextQueries: {
      listener: (listenerId: number) => ({
        contextQueries: {
          node: (nodeId: number) => ({
            queryFn: () => getNetworkLoadBalancerNode(id, listenerId, nodeId),
            queryKey: [nodeId],
          }),
          nodes: {
            contextQueries: {
              all: (params: Params = {}, filter: Filter = {}) => ({
                queryFn: () =>
                  getAllNetworkLoadBalancerNodes(
                    id,
                    listenerId,
                    params,
                    filter,
                  ),
                queryKey: [params, filter],
              }),
              paginated: (params: Params = {}, filter: Filter = {}) => ({
                queryFn: () =>
                  getNetworkLoadBalancerNodes(id, listenerId, params, filter),
                queryKey: [params, filter],
              }),
            },
            queryKey: null,
          },
        },
        queryFn: () => getNetworkLoadBalancerListener(id, listenerId),
        queryKey: [listenerId],
      }),
      listeners: {
        contextQueries: {
          all: (params: Params = {}, filter: Filter = {}) => ({
            queryFn: () =>
              getAllNetworkLoadBalancerListeners(id, params, filter),
            queryKey: [params, filter],
          }),
          paginated: (params: Params = {}, filter: Filter = {}) => ({
            queryFn: () => getNetworkLoadBalancerListeners(id, params, filter),
            queryKey: [params, filter],
          }),
        },
        queryKey: null,
      },
    },
    queryFn: () => getNetworkLoadBalancer(id),
    queryKey: [id],
  }),
  netloadbalancers: {
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllNetworkLoadBalancers(params, filter),
        queryKey: [params, filter],
      }),
      infinite: (filter: Filter = {}) => ({
        queryFn: ({ pageParam }) =>
          getNetworkLoadBalancers(
            { page: pageParam as number, page_size: 25 },
            filter,
          ),
        queryKey: [filter],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getNetworkLoadBalancers(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
});

import {
  getNodeBalancer,
  getNodeBalancerFirewalls,
  getNodeBalancers,
  getNodeBalancerStats,
  getNodeBalancerVPCConfigsBeta,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import {
  getAllNodeBalancerConfigs,
  getAllNodeBalancers,
  getAllNodeBalancerTypes,
} from './requests';

import type { Filter, Params } from '@linode/api-v4';

export const nodebalancerQueries = createQueryKeys('nodebalancers', {
  nodebalancer: (id: number) => ({
    contextQueries: {
      configurations: {
        queryFn: () => getAllNodeBalancerConfigs(id),
        queryKey: null,
      },
      firewalls: {
        queryFn: () => getNodeBalancerFirewalls(id),
        queryKey: null,
      },
      stats: {
        queryFn: () => getNodeBalancerStats(id),
        queryKey: null,
      },
      vpcsBeta: {
        queryFn: () => getNodeBalancerVPCConfigsBeta(id),
        queryKey: null,
      },
    },
    queryFn: () => getNodeBalancer(id),
    queryKey: [id],
  }),
  nodebalancers: {
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllNodeBalancers(params, filter),
        queryKey: [params, filter],
      }),
      infinite: (filter: Filter = {}) => ({
        queryFn: ({ pageParam }) =>
          getNodeBalancers(
            { page: pageParam as number, page_size: 25 },
            filter,
          ),
        queryKey: [filter],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getNodeBalancers(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  types: {
    queryFn: getAllNodeBalancerTypes,
    queryKey: null,
  },
});

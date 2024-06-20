import {
  getLoadbalancer,
  getLoadbalancerCertificate,
  getLoadbalancerCertificates,
  getLoadbalancerConfigurations,
  getLoadbalancerConfigurationsEndpointHealth,
  getLoadbalancerEndpointHealth,
  getLoadbalancerRoutes,
  getLoadbalancerServiceTargets,
  getLoadbalancers,
  getServiceTargetsEndpointHealth,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import type { Filter, Params } from '@linode/api-v4';

export const aclbQueries = createQueryKeys('aclbs', {
  loadbalancer: (id: number) => ({
    contextQueries: {
      certificates: {
        contextQueries: {
          certificate: (certificateId: number) => ({
            queryFn: () => getLoadbalancerCertificate(id, certificateId),
            queryKey: [certificateId],
          }),
          lists: {
            contextQueries: {
              infinite: (filter: Filter = {}) => ({
                queryFn: ({ pageParam }) =>
                  getLoadbalancerCertificates(
                    id,
                    {
                      page: pageParam,
                      page_size: 25,
                    },
                    filter
                  ),
                queryKey: [filter],
              }),
              paginated: (params: Params = {}, filter: Filter = {}) => ({
                queryFn: () => getLoadbalancerCertificates(id, params, filter),
                queryKey: [params, filter],
              }),
            },
            queryKey: null,
          },
        },
        queryKey: null,
      },
      configurations: {
        contextQueries: {
          endpointHealth: {
            queryFn: () => getLoadbalancerConfigurationsEndpointHealth(id),
            queryKey: null,
          },
          lists: {
            contextQueries: {
              infinite: {
                queryFn: ({ pageParam }) =>
                  getLoadbalancerConfigurations(id, {
                    page: pageParam,
                    page_size: 25,
                  }),
                queryKey: null,
              },
              paginated: (params: Params = {}, filter: Filter = {}) => ({
                queryFn: () =>
                  getLoadbalancerConfigurations(id, params, filter),
                queryKey: [params, filter],
              }),
            },
            queryKey: null,
          },
        },
        queryKey: null,
      },
      endpointHealth: {
        queryFn: () => getLoadbalancerEndpointHealth(id),
        queryKey: null,
      },
      routes: {
        contextQueries: {
          lists: {
            contextQueries: {
              infinite: (filter: Filter = {}) => ({
                queryFn: ({ pageParam }) =>
                  getLoadbalancerRoutes(
                    id,
                    {
                      page: pageParam,
                      page_size: 25,
                    },
                    filter
                  ),
                queryKey: [filter],
              }),
              paginated: (params: Params = {}, filter: Filter = {}) => ({
                queryFn: () => getLoadbalancerRoutes(id, params, filter),
                queryKey: [params, filter],
              }),
            },
            queryKey: null,
          },
        },
        queryKey: null,
      },
      serviceTargets: {
        contextQueries: {
          endpointHealth: {
            queryFn: () => getServiceTargetsEndpointHealth(id),
            queryKey: null,
          },
          lists: {
            contextQueries: {
              infinite: (filter: Filter = {}) => ({
                queryFn: ({ pageParam }) =>
                  getLoadbalancerServiceTargets(
                    id,
                    {
                      page: pageParam,
                      page_size: 25,
                    },
                    filter
                  ),
                queryKey: [filter],
              }),
              paginated: (params: Params = {}, filter: Filter = {}) => ({
                queryFn: () =>
                  getLoadbalancerServiceTargets(id, params, filter),
                queryKey: [params, filter],
              }),
            },
            queryKey: null,
          },
        },
        queryKey: null,
      },
    },
    queryFn: () => getLoadbalancer(id),
    queryKey: [id],
  }),
  paginated: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getLoadbalancers(params, filter),
    queryKey: [params, filter],
  }),
});

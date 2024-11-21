import {
  getCloudPulseServiceTypes,
  getDashboardById,
  getDashboards,
  getJWEToken,
  getMetricDefinitionsByServiceType,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import { databaseQueries } from '../databases/databases';
import { getAllLinodesRequest } from '../linodes/requests';
import { volumeQueries } from '../volumes/volumes';
import { fetchCloudPulseMetrics } from './metrics';

import type {
  CloudPulseMetricsRequest,
  Filter,
  JWETokenPayLoad,
  Params,
} from '@linode/api-v4';

const key = 'Clousepulse';

export const queryFactory = createQueryKeys(key, {
  dashboardById: (dashboardId: number) => ({
    queryFn: () => getDashboardById(dashboardId),
    queryKey: [dashboardId],
  }),
  lists: {
    contextQueries: {
      dashboards: (serviceType: string) => ({
        queryFn: () => getDashboards(serviceType),
        queryKey: [serviceType],
      }),
      serviceTypes: {
        queryFn: getCloudPulseServiceTypes,
        queryKey: null,
      },
    },
    queryKey: null,
  },
  metrics: (
    token: string,
    readApiEndpoint: string,
    serviceType: string,
    requestData: CloudPulseMetricsRequest,
    timeStamp: number | undefined,
    label: string
  ) => ({
    queryFn: () =>
      fetchCloudPulseMetrics(token, readApiEndpoint, serviceType, requestData),
    queryKey: [requestData, timeStamp, label],
  }),
  metricsDefinitons: (serviceType: string | undefined) => ({
    queryFn: () => getMetricDefinitionsByServiceType(serviceType!),
    queryKey: [serviceType],
  }),

  resources: (
    resourceType: string | undefined,
    params?: Params,
    filters?: Filter
  ) => {
    switch (resourceType) {
      case 'linode':
        return {
          queryFn: () => getAllLinodesRequest(params, filters), // since we don't have query factory implementation, in linodes.ts, once it is ready we will reuse that, untill then we will use same query keys
          queryKey: ['linodes', params, filters],
        };
      case 'volumes':
        return volumeQueries.lists._ctx.all(params, filters); // in this we don't need to define our own query factory, we will reuse existing implementation in volumes.ts

      case 'dbaas':
        return databaseQueries.databases._ctx.all(params, filters);

      default:
        return volumeQueries.lists._ctx.all(params, filters); // default to volumes
    }
  },

  token: (serviceType: string | undefined, request: JWETokenPayLoad) => ({
    queryFn: () => getJWEToken(request, serviceType!),
    queryKey: [serviceType, { resource_ids: request.resource_ids.sort() }],
  }),
});

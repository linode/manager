import {
  getAlertDefinitionByServiceTypeAndId,
  getCloudPulseServiceByServiceType,
  getCloudPulseServiceTypes,
  getDashboardById,
  getDashboards,
  getJWEToken,
  getMetricDefinitionsByServiceType,
} from '@linode/api-v4';
import {
  databaseQueries,
  firewallQueries,
  getAllLinodesRequest,
  nodebalancerQueries,
  volumeQueries,
} from '@linode/queries';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import { kubernetesQueries } from '../kubernetes';
import { objectStorageQueries } from '../object-storage/queries';
import {
  getAllBucketsFromEndpoints,
  getAllObjectStorageEndpoints,
} from '../object-storage/requests';
import { fetchCloudPulseMetrics } from './metrics';
import {
  getAllAlertsRequest,
  getAllertsByServiceTypeRequest,
  getAllNotificationChannels,
} from './requests';

import type {
  CloudPulseMetricsRequest,
  Filter,
  JWETokenPayLoad,
  Params,
} from '@linode/api-v4';

const key = 'Clousepulse';

export const queryFactory = createQueryKeys(key, {
  alerts: {
    contextQueries: {
      alert: {
        // This query key is a placeholder , it will be updated once the relevant queries are added
        queryKey: null,
      },
      alertByServiceTypeAndId: (serviceType: string, alertId: string) => ({
        queryFn: () =>
          getAlertDefinitionByServiceTypeAndId(serviceType, alertId),
        queryKey: [alertId, serviceType],
      }),
      alertsByServiceType: (serviceType: string) => ({
        queryFn: () => getAllertsByServiceTypeRequest(serviceType),
        queryKey: [serviceType],
      }),
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllAlertsRequest(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  dashboardById: (dashboardId: number) => ({
    queryFn: () => getDashboardById(dashboardId),
    queryKey: [dashboardId],
  }),
  serviceByServiceType: (serviceType: string) => ({
    queryFn: () => getCloudPulseServiceByServiceType(serviceType),
    queryKey: [serviceType],
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
  metricsDefinitons: (
    serviceType: string | undefined,
    params?: Params,
    filter?: Filter
  ) => ({
    queryFn: () =>
      getMetricDefinitionsByServiceType(serviceType!, params, filter),
    queryKey: [serviceType],
  }),
  notificationChannels: {
    contextQueries: {
      all: (params?: Params, filter?: Filter) => ({
        queryFn: () => getAllNotificationChannels(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  resources: (
    resourceType: string | undefined,
    params?: Params,
    filters?: Filter
  ) => {
    switch (resourceType) {
      case 'blockstorage':
        return volumeQueries.lists._ctx.all(params, filters); // in this we don't need to define our own query factory, we will reuse existing implementation in volumes.ts
      case 'dbaas':
        return databaseQueries.databases._ctx.all(params, filters);
      case 'firewall':
        return firewallQueries.firewalls._ctx.all(params, filters);
      case 'linode':
        return {
          queryFn: () => getAllLinodesRequest(params, filters), // since we don't have query factory implementation, in linodes.ts, once it is ready we will reuse that, untill then we will use same query keys
          queryKey: ['linodes', params, filters],
        };
      case 'lke':
        return kubernetesQueries.lists._ctx.all;
      case 'nodebalancer':
        return nodebalancerQueries.nodebalancers._ctx.all(params, filters);
      case 'objectstorage':
        return {
          queryFn: () => getAllBuckets(),
          queryKey: [
            ...objectStorageQueries.endpoints.queryKey,
            objectStorageQueries.buckets.queryKey[1],
          ],
        };
      case 'volumes':
        return volumeQueries.lists._ctx.all(params, filters); // in this we don't need to define our own query factory, we will reuse existing implementation in volumes.ts
      default:
        return volumeQueries.lists._ctx.all(params, filters); // default to volumes
    }
  },

  token: (serviceType: string | undefined, request: JWETokenPayLoad) => ({
    queryFn: () => getJWEToken(request, serviceType!),
    queryKey: [serviceType, { resource_ids: request.entity_ids?.sort() }],
  }),
});

const getAllBuckets = async () => {
  const endpoints = await getAllObjectStorageEndpoints();

  // Get all the buckets from the endpoints
  const allBuckets = await getAllBucketsFromEndpoints(endpoints);

  // Throw the error if we encounter any error for any single call.
  if (allBuckets.errors.length) {
    throw new Error('Unable to fetch the data.');
  }

  // Filter the E0, E1 endpoint_type out and return the buckets
  return allBuckets.buckets.filter(
    (bucket) => bucket.endpoint_type !== 'E0' && bucket.endpoint_type !== 'E1'
  );
};

import { pickRandom, regions } from '@linode/utilities';
import { http } from 'msw';

import { objectStorageEndpointsFactory } from 'src/factories/objectStorage';
import { quotaFactory, quotaUsageFactory } from 'src/factories/quotas';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type {
  ObjectStorageEndpoint,
  Quota,
  QuotaType,
  QuotaUsage,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

const mockQuotas: Record<QuotaType, Quota[]> = {
  linode: [
    ...regions.map((region) =>
      quotaFactory.build({
        description:
          'Max number of vCPUs assigned to Linodes with Dedicated plans',
        quota_limit: 50,
        quota_name: 'Dedicated CPU',
        region_applied: region.id,
        resource_metric: 'CPU',
      })
    ),
    ...regions.map((region) =>
      quotaFactory.build({
        description:
          'Max number of vCPUs assigned to Linodes with Shared plans',
        quota_limit: 100,
        quota_name: 'Shared CPU',
        region_applied: region.id,
        resource_metric: 'CPU',
      })
    ),
    ...regions.map((region) =>
      quotaFactory.build({
        description: 'Max number of GPUs assigned to Linodes with GPU plans',
        quota_limit: 25,
        quota_name: 'GPU',
        region_applied: region.id,
        resource_metric: 'GPU',
      })
    ),
    ...regions.map((region) =>
      quotaFactory.build({
        description: 'Max number of VPUs assigned to Linodes with VPU plans',
        quota_limit: 10,
        quota_name: 'VPU',
        region_applied: region.id,
        resource_metric: 'VPU',
      })
    ),
    ...regions.map((region) =>
      quotaFactory.build({
        description:
          'Max number of vCPUs assigned to Linodes with High Memory plans',
        quota_limit: 15,
        quota_name: 'High Memory',
        region_applied: region.id,
        resource_metric: 'CPU',
      })
    ),
  ],
  lke: [
    ...regions.map((region) =>
      quotaFactory.build({
        quota_limit: 50,
        quota_name: 'Total number of Clusters',
        region_applied: region.id,
        resource_metric: 'cluster',
      })
    ),
  ],
  'object-storage': [
    quotaFactory.build({
      description: 'The total capacity of your Object Storage account',
      endpoint_type: 'E0',
      quota_limit: 1_000_000_000_000_000, // a petabyte
      quota_name: 'Total Capacity',
      resource_metric: 'byte',
      s3_endpoint: 'us-east-1.linodeobjects.com',
    }),
    quotaFactory.build({
      description:
        'The allowed number of buckets in your Object Storage account',
      endpoint_type: 'E0',
      quota_limit: 100,
      quota_name: 'Number of Buckets',
      resource_metric: 'bucket',
      s3_endpoint: 'us-west-1.linodeobjects.com',
    }),
    quotaFactory.build({
      description: 'The total number of objects in your Object Storage account',
      endpoint_type: 'E3',
      quota_limit: 10_000_000,
      quota_name: 'Number of Objects',
      resource_metric: 'object',
      s3_endpoint: 'br-gru-1.linodeobjects.com',
    }),
  ],
};

const mockS3Endpoints = mockQuotas['object-storage'].map((quota) =>
  objectStorageEndpointsFactory.build({
    endpoint_type: quota.endpoint_type,
    region: quota.region_applied,
    s3_endpoint: quota.s3_endpoint,
  })
);

export const getS3Endpoint = () => [
  http.get(
    '*/v4*/object-storage/endpoints',
    async ({
      request,
    }): Promise<
      StrictResponse<
        APIErrorResponse | APIPaginatedResponse<ObjectStorageEndpoint>
      >
    > => {
      return makePaginatedResponse({
        data: mockS3Endpoints,
        request,
      });
    }
  ),
];

export const getQuotas = () => [
  http.get(
    '*/v4*/:service/quotas',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Quota>>
    > => {
      const xFilters = request.headers.get('X-Filter');
      const filters = xFilters ? JSON.parse(xFilters) : {};

      // if we got a global filter, do a randomized sorting on the data,
      // otherwise, return the data as is
      const data =
        filters.region_applied || filters.s3_endpoint === 'global'
          ? mockQuotas[params.service as QuotaType].sort(
              () => Math.random() - 0.5
            )
          : mockQuotas[params.service as QuotaType];

      return makePaginatedResponse({
        data,
        request,
      });
    }
  ),

  http.get(
    '*/v4*/:service/quotas/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Quota>> => {
      const quota = mockQuotas[params.service as QuotaType].find(
        ({ quota_id }) => quota_id === +params.id
      );

      if (!quota) {
        return makeNotFoundResponse();
      }

      return makeResponse(quota);
    }
  ),

  http.get(
    '*/v4*/:service/quotas/:id/usage',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | QuotaUsage>> => {
      const service = params.service as QuotaType;
      const quota = mockQuotas[service].find(
        ({ quota_id }) => quota_id === +params.id
      );

      if (!quota) {
        return makeNotFoundResponse();
      }

      switch (service) {
        case 'linode':
          switch (quota.quota_name) {
            case 'Dedicated CPU':
              return makeResponse(
                quotaUsageFactory.build({
                  quota_limit: quota.quota_limit,
                  used: 45,
                })
              );
            case 'Shared CPU':
              return makeResponse(
                quotaUsageFactory.build({
                  quota_limit: quota.quota_limit,
                  used: 24,
                })
              );
            case 'GPU':
              return makeResponse(
                quotaUsageFactory.build({
                  quota_limit: quota.quota_limit,
                  used: 3,
                })
              );
            case 'VPU':
              return makeResponse(
                quotaUsageFactory.build({
                  quota_limit: quota.quota_limit,
                  used: 7,
                })
              );
            default:
              return makeResponse(
                quotaUsageFactory.build({
                  quota_limit: quota.quota_limit,
                  used: null,
                })
              );
          }
        case 'lke':
          return makeResponse(
            quotaUsageFactory.build({
              quota_limit: quota.quota_limit,
              used: pickRandom([2, 27, 5, 38, 49]),
            })
          );
        case 'object-storage':
          switch (quota.quota_name) {
            case 'Total Capacity':
              return makeResponse(
                quotaUsageFactory.build({
                  quota_limit: quota.quota_limit,
                  used: 100_000_000_000_000,
                })
              );
            case 'Number of Buckets':
              return makeResponse(
                quotaUsageFactory.build({
                  quota_limit: quota.quota_limit,
                  used: 75,
                })
              );
            case 'Number of Objects':
              return makeResponse(
                quotaUsageFactory.build({
                  quota_limit: quota.quota_limit,
                  used: 10_000_000,
                })
              );
            default:
              makeResponse(
                quotaUsageFactory.build({
                  quota_limit: quota.quota_limit,
                  used: null,
                })
              );
          }
        default:
          return makeNotFoundResponse();
      }
    }
  ),
];

import { http } from 'msw';

import { regions } from 'src/__data__/regionsData';
import { quotaFactory, quotaUsageFactory } from 'src/factories/quotas';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';
import { pickRandom } from 'src/utilities/random';

import type { Quota, QuotaType, QuotaUsage } from '@linode/api-v4';
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
        quota_limit: pickRandom([10, 20, 30, 40, 50]),
        quota_name: 'Dedicated CPU',
        region_applied: region.id,
        resource_metric: 'CPU',
      })
    ),
    ...regions.map((region) =>
      quotaFactory.build({
        description:
          'Max number of vCPUs assigned to Linodes with Shared plans',
        quota_limit: pickRandom([25, 50, 75, 100, 125]),
        quota_name: 'Shared CPU',
        region_applied: region.id,
        resource_metric: 'CPU',
      })
    ),
    ...regions.map((region) =>
      quotaFactory.build({
        description: 'Max number of GPUs assigned to Linodes with GPU plans',
        quota_limit: pickRandom([5, 6, 7, 8, 9, 10]),
        quota_name: 'GPU',
        region_applied: region.id,
        resource_metric: 'GPU',
      })
    ),
    ...regions.map((region) =>
      quotaFactory.build({
        description: 'Max number of VPUs assigned to Linodes with VPU plans',
        quota_limit: pickRandom([10, 20, 30, 40, 50]),
        quota_name: 'VPU',
        region_applied: region.id,
        resource_metric: 'VPU',
      })
    ),
    ...regions.map((region) =>
      quotaFactory.build({
        description:
          'Max number of vCPUs assigned to Linodes with High Memory plans',
        quota_limit: pickRandom([10, 20, 30, 40, 50]),
        quota_name: 'High Memory',
        region_applied: region.id,
        resource_metric: 'CPU',
      })
    ),
  ],
  lke: [
    ...regions.map((region) =>
      quotaFactory.build({
        quota_limit: pickRandom([10, 20, 30, 40, 50]),
        quota_name: 'Total number of Clusters',
        region_applied: region.id,
        resource_metric: 'cluster',
      })
    ),
  ],
  'object-storage': [
    quotaFactory.build({
      description: 'The total capacity of your Object Storage account',
      endpoint_type: 'E3',
      quota_limit: 1_000_000_000_000_000, // a petabyte
      quota_name: 'Total Capacity',
      resource_metric: 'byte',
      s3_endpoint: 'us-east-1.linodeobjects.com',
    }),
    quotaFactory.build({
      description:
        'The allowed number of buckets in your Object Storage account',
      endpoint_type: 'E1',
      quota_limit: 1000,
      quota_name: 'Number of Buckets',
      resource_metric: 'bucket',
      s3_endpoint: 'foobar.us-east-1.linodeobjects.com',
    }),
    quotaFactory.build({
      description: 'The total number of objects in your Object Storage account',
      endpoint_type: 'E3',
      quota_limit: 10_000_000,
      quota_name: 'Number of Objects',
      resource_metric: 'object',
      s3_endpoint: 'us-east-1.linodeobjects.com',
    }),
  ],
};

export const getQuotas = () => [
  http.get(
    '*/v4/:service/quotas',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Quota>>
    > => {
      return makePaginatedResponse({
        data: mockQuotas[params.service as QuotaType],
        request,
      });
    }
  ),

  http.get(
    '*/v4/:service/quotas/:id',
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
    '*/v4/:service/quotas/:id/usage',
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
          return makeResponse(
            quotaUsageFactory.build({
              quota_limit: quota.quota_limit,
              used: pickRandom([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
            })
          );
        case 'lke':
          return makeResponse(
            quotaUsageFactory.build({
              quota_limit: quota.quota_limit,
              used: pickRandom([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
            })
          );
        case 'object-storage':
          return makeResponse(
            quotaUsageFactory.build({
              quota_limit: quota.quota_limit,
              used:
                quota.quota_name === 'Total Capacity'
                  ? pickRandom([
                      0,
                      100_000_000,
                      200_000_000,
                      300_000_000,
                      400_000_000,
                    ])
                  : pickRandom([100, 200, 300, 400, 500]),
            })
          );
        default:
          return makeNotFoundResponse();
      }
    }
  ),
];

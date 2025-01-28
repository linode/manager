import { http } from 'msw';

import { quotaFactory } from 'src/factories/quotas';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { Quota, QuotaType } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

const mockQuotas: Record<QuotaType, Quota[]> = {
  linode: [
    quotaFactory.build({
      description:
        'Max number of vCPUs assigned to Linodes with Dedicated plans',
      quota_limit: 10,
      quota_name: 'Dedicated CPU',
      region_applied: 'us-east',
      resource_metric: 'CPU',
      used: 8,
    }),
    quotaFactory.build({
      description: 'Max number of vCPUs assigned to Linodes with Shared plans',
      quota_limit: 25,
      quota_name: 'Shared CPU',
      region_applied: 'us-east',
      resource_metric: 'CPU',
      used: 22,
    }),
    quotaFactory.build({
      description: 'Max number of GPUs assigned to Linodes with GPU plans',
      quota_limit: 10,
      quota_name: 'GPU',
      region_applied: 'us-east',
      resource_metric: 'GPU',
      used: 5,
    }),
    quotaFactory.build({
      description: 'Max number of VPUs assigned to Linodes with VPU plans',
      quota_limit: 100,
      quota_name: 'VPU',
      region_applied: 'us-east',
      resource_metric: 'VPU',
      used: 20,
    }),
    quotaFactory.build({
      description:
        'Max number of vCPUs assigned to Linodes with High Memory plans',
      quota_limit: 30,
      quota_name: 'High Memory',
      region_applied: 'us-east',
      resource_metric: 'CPU',
      used: 0,
    }),
  ],
  lke: [
    quotaFactory.build({
      quota_limit: 20,
      quota_name: 'Total number of Clusters',
      region_applied: 'us-east',
      resource_metric: 'cluster',
      used: 12,
    }),
  ],
  'object-storage': [
    quotaFactory.build({
      endpoint_type: 'E3',
      quota_limit: 1_000_000_000_000_000, // a petabyte
      quota_name: 'Total Capacity',
      region_applied: 'us-east',
      resource_metric: 'byte',
      s3_endpoint: 'us-east-1.linodeobjects.com',
      used: 900_000_000_000_000,
    }),
    quotaFactory.build({
      endpoint_type: 'E3',
      quota_limit: 1000,
      quota_name: 'Number of Buckets',
      region_applied: 'us-east',
      resource_metric: 'bucket',
      s3_endpoint: 'us-east-1.linodeobjects.com',
    }),
    quotaFactory.build({
      endpoint_type: 'E3',
      quota_limit: 10_000_000,
      quota_name: 'Number of Objects',
      region_applied: 'us-east',
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
];

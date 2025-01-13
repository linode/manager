import { http } from 'msw';

import { quotaFactory } from 'src/factories/quotas';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { Quota, QuotaType } from '@linode/api-v4/lib/quotas/types';
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
      resource_metric: 'instances',
      service_name: 'Linode Dedicated',
      unit: 'vCPUs',
      used: 8,
    }),
    quotaFactory.build({
      description: 'Max number of vCPUs assigned to Linodes with Shared plans',
      quota_limit: 25,
      quota_name: 'Shared CPU',
      resource_metric: 'instances',
      service_name: 'Linode Shared',
      unit: 'vCPUs',
      used: 22,
    }),
    quotaFactory.build({
      description: 'Max number of GPUs assigned to Linodes with GPU plans',
      quota_limit: 10,
      quota_name: 'GPU',
      resource_metric: 'instances',
      service_name: 'Linode GPU',
      unit: 'GPUs',
      used: 5,
    }),
    quotaFactory.build({
      description: 'Max number of VPUs assigned to Linodes with VPU plans',
      quota_limit: 100,
      quota_name: 'VPU',
      resource_metric: 'instances',
      service_name: 'Linode VPU',
      unit: 'VPUs',
      used: 20,
    }),
    quotaFactory.build({
      description:
        'Max number of vCPUs assigned to Linodes with High Memory plans',
      quota_limit: 30,
      quota_name: 'High Memory',
      resource_metric: 'instances',
      service_name: 'Linode High Memory',
      unit: 'vCPUs',
      used: 0,
    }),
  ],
  lke: [
    quotaFactory.build({
      quota_limit: 20,
      quota_name: 'Total number of Clusters',
      resource_metric: 'instances',
      service_name: 'LKE',
      unit: 'clusters',
      used: 12,
    }),
  ],
  'object-storage': [
    quotaFactory.build({
      quota_limit: 1_000_000_000_000_000, // a petabyte
      quota_name: 'Total Capacity',
      resource_metric: 'bytes',
      service_name: 'Object Storage',
      unit: 'bytes',
      used: 900_000_000_000_000,
    }),
    quotaFactory.build({
      quota_limit: 1000,
      quota_name: 'Number of Buckets',
      resource_metric: 'instances',
      service_name: 'Object Storage',
      unit: 'buckets',
    }),
    quotaFactory.build({
      quota_limit: 10_000_000,
      quota_name: 'Number of Objects',
      resource_metric: 'instances',
      service_name: 'Object Storage',
      unit: 'objects',
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

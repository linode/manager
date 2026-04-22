import { getQuota, getQuotas, getQuotaUsage } from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getAllQuotas } from './requests';

import type {
  Filter,
  Params,
  QuotaCollection,
  QuotaServiceType,
} from '@linode/api-v4';

export const quotaQueries = createQueryKeys('quotas', {
  serviceQuotas: (
    serviceType: QuotaServiceType,
    quotaCollection: QuotaCollection,
  ) => ({
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () =>
          getAllQuotas(serviceType, quotaCollection, params, filter),
        queryKey: [params, filter, quotaCollection],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getQuotas(serviceType, quotaCollection, params, filter),
        queryKey: [params, filter, quotaCollection],
      }),
      quota: (id: number) => ({
        queryFn: () => getQuota(serviceType, quotaCollection, id),
        queryKey: [id, quotaCollection],
      }),
      usage: (id: string) => ({
        queryFn: () => getQuotaUsage(serviceType, quotaCollection, id),
        queryKey: [id, quotaCollection],
      }),
    },
    queryKey: [serviceType],
  }),
});

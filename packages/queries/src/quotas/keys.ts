import { getQuota, getQuotas, getQuotaUsage } from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getAllQuotas } from './requests';

import type { Filter, Params, QuotaServiceType } from '@linode/api-v4';

export const quotaQueries = createQueryKeys('quotas', {
  serviceQuotas: (serviceType: QuotaServiceType, apiCollection: string) => ({
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllQuotas(serviceType, apiCollection, params, filter),
        queryKey: [params, filter, apiCollection],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getQuotas(serviceType, apiCollection, params, filter),
        queryKey: [params, filter, apiCollection],
      }),
      quota: (id: number) => ({
        queryFn: () => getQuota(serviceType, apiCollection, id),
        queryKey: [id, apiCollection],
      }),
      usage: (id: string) => ({
        queryFn: () => getQuotaUsage(serviceType, apiCollection, id),
        queryKey: [id, apiCollection],
      }),
    },
    queryKey: [serviceType],
  }),
});

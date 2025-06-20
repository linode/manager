import { getQuota, getQuotas, getQuotaUsage } from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getAllQuotas } from './requests';

import type { Filter, Params, QuotaType } from '@linode/api-v4';

export const quotaQueries = createQueryKeys('quotas', {
  service: (type: QuotaType) => ({
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllQuotas(type, params, filter),
        queryKey: [params, filter],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getQuotas(type, params, filter),
        queryKey: [params, filter],
      }),
      quota: (id: number) => ({
        queryFn: () => getQuota(type, id),
        queryKey: [id],
      }),
      usage: (id: string) => ({
        queryFn: () => getQuotaUsage(type, id),
        queryKey: [id],
      }),
    },
    queryKey: [type],
  }),
});

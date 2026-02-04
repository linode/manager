import { getQuota, getQuotas, getQuotaUsage } from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import { getAllQuotas } from './requests';

import type { Filter, Params, QuotaType } from '@linode/api-v4';

export const quotaQueries = createQueryKeys('quotas', {
  service: (type: QuotaType, collection: string) => ({
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllQuotas(type, collection, params, filter),
        queryKey: [params, filter, collection],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getQuotas(type, collection, params, filter),
        queryKey: [params, filter, collection],
      }),
      quota: (id: number) => ({
        queryFn: () => getQuota(type, collection, id),
        queryKey: [id, collection],
      }),
      usage: (id: string) => ({
        queryFn: () => getQuotaUsage(type, collection, id),
        queryKey: [id, collection],
      }),
    },
    queryKey: [type],
  }),
});

import { getQuota, getQuotas, getQuotaUsage } from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getAllQuotas } from './requests';

import type {
  APIError,
  Filter,
  Params,
  Quota,
  QuotaType,
  QuotaUsage,
  ResourcePage,
} from '@linode/api-v4';

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
      usage: (id: number) => ({
        queryFn: () => getQuotaUsage(type, id),
        queryKey: [id],
      }),
    },
    queryKey: [type],
  }),
});

export const useQuotaQuery = (service: QuotaType, id: number, enabled = true) =>
  useQuery<Quota, APIError[]>({
    ...quotaQueries.service(service)._ctx.quota(id),
    enabled,
  });

export const useQuotasQuery = (
  service: QuotaType,
  params: Params = {},
  filter: Filter,
  enabled = true,
) =>
  useQuery<ResourcePage<Quota>, APIError[]>({
    ...quotaQueries.service(service)._ctx.paginated(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useAllQuotasQuery = (
  service: QuotaType,
  params: Params = {},
  filter: Filter,
  enabled = true,
) =>
  useQuery<Quota[], APIError[]>({
    ...quotaQueries.service(service)._ctx.all(params, filter),
    enabled,
  });

export const useQuotaUsageQuery = (
  service: QuotaType,
  id: number,
  enabled = true,
) =>
  useQuery<QuotaUsage, APIError[]>({
    ...quotaQueries.service(service)._ctx.usage(id),
    enabled,
  });

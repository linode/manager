import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { quotaQueries } from './keys';

import type {
  APIError,
  Filter,
  Params,
  Quota,
  QuotaType,
  QuotaUsage,
  ResourcePage,
} from '@linode/api-v4';

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
  id: string,
  enabled = true,
) =>
  useQuery<QuotaUsage, APIError[]>({
    ...quotaQueries.service(service)._ctx.usage(id),
    enabled,
  });

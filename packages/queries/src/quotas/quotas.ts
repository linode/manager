import { useQuery } from '@tanstack/react-query';

import { useQueries } from '../index';
import { quotaQueries } from './keys';

import type {
  APIError,
  Filter,
  Quota,
  QuotaCollection,
  QuotaServiceType,
  QuotaUsage,
} from '@linode/api-v4';
import type { UseQueryResult } from '@tanstack/react-query';

export const useAllQuotasQuery = (
  serviceType: QuotaServiceType,
  quotaCollection: QuotaCollection,
  filter: Filter = {},
  enabled = true,
): UseQueryResult<Quota[], APIError[]> =>
  useQuery<Quota[], APIError[]>({
    ...quotaQueries
      .serviceQuotas(serviceType, quotaCollection)
      ._ctx.all({}, filter),
    enabled,
  });

export const useQuotaUsageQueries = (
  serviceType: QuotaServiceType,
  quotaCollection: QuotaCollection,
  quotaIds: string[],
  enabled = true,
): UseQueryResult<QuotaUsage, APIError[]>[] =>
  useQueries({
    queries: quotaIds.map((quotaId) => ({
      ...quotaQueries
        .serviceQuotas(serviceType, quotaCollection)
        ._ctx.usage(quotaId),
      enabled: enabled && quotaIds.length > 0,
    })),
  });

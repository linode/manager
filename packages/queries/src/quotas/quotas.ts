import { useQuery } from '@tanstack/react-query';

import { useQueries } from '../index';
import { quotaQueries } from './keys';

import type {
  APIError,
  Filter,
  Quota,
  QuotaServiceType,
  QuotaUsage,
} from '@linode/api-v4';
import type { UseQueryResult } from '@tanstack/react-query';

export const useAllQuotasQuery = (
  serviceType: QuotaServiceType,
  apiCollection: string,
  filter: Filter = {},
  enabled = true,
): UseQueryResult<Quota[], APIError[]> =>
  useQuery<Quota[], APIError[]>({
    ...quotaQueries
      .serviceQuotas(serviceType, apiCollection)
      ._ctx.all({}, filter),
    enabled,
  });

export const useQuotaUsageQueries = (
  serviceType: QuotaServiceType,
  apiCollection: string,
  quotaIds: string[],
  enabled = true,
): UseQueryResult<QuotaUsage, APIError[]>[] =>
  useQueries({
    queries: quotaIds.map((quotaId) => ({
      ...quotaQueries
        .serviceQuotas(serviceType, apiCollection)
        ._ctx.usage(quotaId),
      enabled: enabled && quotaIds.length > 0,
    })),
  });

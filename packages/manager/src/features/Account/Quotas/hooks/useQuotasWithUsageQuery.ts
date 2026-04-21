import { useAllQuotasQuery, useQuotaUsageQueries } from '@linode/queries';
import * as React from 'react';

import type { APIError, Filter, QuotaUsage } from '@linode/api-v4';
import type { UseQueryResult } from '@tanstack/react-query';
import type {
  QuotaScope,
  QuotaScopeDefinition,
  QuotaService,
} from 'src/features/Account/Quotas/quotaServices';
import type { QuotaWithUsage } from 'src/features/Account/Quotas/utils';

interface QuotasWithUsageQueryProps {
  enabled: boolean;
  scope: QuotaScope;
  scopeValue: null | string;
  service: QuotaService;
}

interface QuotasWithUsageQueryResult {
  data: QuotaWithUsage[];
  error: null | string;
  isError: boolean;
  isFetching: boolean;
}

export const useQuotasWithUsageQuery = ({
  service,
  scope,
  scopeValue,
  enabled = true,
}: QuotasWithUsageQueryProps): QuotasWithUsageQueryResult => {
  // The provided scope should always be supported by the provided service, but just
  // for the sake of error handling, fallback to a default scope if it's not
  const scopeDefinition: QuotaScopeDefinition = service.scopes[scope] ?? {
    quotaCollection: 'quotas',
  };

  const apiFilter: Filter = React.useMemo(() => {
    return (
      (scopeValue ? scopeDefinition?.apiFilterFunction?.(scopeValue) : null) ??
      {}
    );
  }, [scopeDefinition, scopeValue]);

  const {
    data: quotas,
    error: quotasError,
    isFetching: isFetchingQuotas,
    isError: isQuotasFetchError,
  } = useAllQuotasQuery(
    service.type,
    scopeDefinition.quotaCollection,
    apiFilter,
    enabled
  );

  // For each quota providing usage, fetch the usage in parallel
  const quotaIdsHavingUsage = React.useMemo(
    () =>
      quotas
        ?.filter((quota) => ('has_usage' in quota ? quota.has_usage : true))
        .map((quota) => quota.quota_id) ?? [],
    [quotas]
  );

  const quotaUsageQueries = useQuotaUsageQueries(
    service.type,
    scopeDefinition.quotaCollection,
    quotaIdsHavingUsage,
    enabled
  );

  const usageQueryByQuotaId = React.useMemo(() => {
    const map = new Map<string, UseQueryResult<QuotaUsage, APIError[]>>();
    quotaIdsHavingUsage.forEach((quotaId, i) => {
      const usageQuery = quotaUsageQueries[i];
      if (usageQuery) {
        map.set(quotaId, usageQuery);
      }
    });
    return map;
  }, [quotaIdsHavingUsage, quotaUsageQueries]);

  // calculate the fingerprint of the usage queries to use as a dependency for the quotasWithUsage memo.
  const usageQueriesFingerprint = quotaUsageQueries
    .map((query) => `${query.data?.usage ?? ''}&${query.isError ? 1 : 0}`)
    .join('|');

  const quotasWithUsage: QuotaWithUsage[] = React.useMemo(
    () =>
      quotas
        ?.filter((quota) =>
          scopeDefinition.visibilityFilterFunction
            ? scopeDefinition.visibilityFilterFunction(quota)
            : true
        )
        .map((quota) => {
          const quotaUsageQuery = usageQueryByQuotaId.get(quota.quota_id);
          const transformedQuota = scopeDefinition.transformFunction
            ? scopeDefinition.transformFunction(quota)
            : quota;
          return {
            quota: transformedQuota,
            hasUsage: Boolean(quotaUsageQuery),
            usage: quotaUsageQuery?.data?.usage ?? null,
            isFetchingUsage: quotaUsageQuery?.isFetching ?? false,
            fetchingUsageFailed: quotaUsageQuery?.isError ?? false,
            usageFetchErrorMessage: quotaUsageQuery?.error?.[0]?.reason ?? null,
          };
        }) ?? [],
    [quotas, scopeDefinition, usageQueryByQuotaId, usageQueriesFingerprint]
  );

  return {
    data: quotasWithUsage,
    error: quotasError?.[0]?.reason ?? null,
    isFetching: isFetchingQuotas,
    isError: isQuotasFetchError,
  };
};

import {
  globalQuotaQueries,
  useGlobalQuotasQuery,
  useQueries,
} from '@linode/queries';
import React from 'react';

const SERVICE = 'object-storage';

export function useGetObjGlobalQuotasWithUsage() {
  const {
    data: globalQuotas,
    error: globalQuotasError,
    isFetching: isFetchingGlobalQuotas,
  } = useGlobalQuotasQuery(SERVICE);

  // Quota Usage Queries
  // For each global quota, fetch the usage in parallel
  // This will only fetch for the paginated set
  const globalQuotaIds =
    globalQuotas?.data.map((quota) => quota.quota_id) ?? [];
  const globalQuotaUsageQueries = useQueries({
    queries: globalQuotaIds.map((quotaId) =>
      globalQuotaQueries.service(SERVICE)._ctx.usage(quotaId)
    ),
  });

  // Combine the quotas with their usage
  const globalQuotasWithUsage = React.useMemo(
    () =>
      globalQuotas?.data.map((quota, index) => ({
        ...quota,
        usage: globalQuotaUsageQueries?.[index]?.data,
      })) ?? [],
    [globalQuotas, globalQuotaUsageQueries]
  );

  return {
    data: globalQuotasWithUsage,
    isError:
      globalQuotasError ||
      globalQuotaUsageQueries.some((query) => query.isError),
    isFetching:
      isFetchingGlobalQuotas ||
      globalQuotaUsageQueries.some((query) => query.isFetching),
  };
}

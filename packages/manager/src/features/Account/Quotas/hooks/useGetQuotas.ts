import { quotaQueries, useAllQuotasQuery, useQueries } from '@linode/queries';
import * as React from 'react';

import {
  getQuotaMapper,
  getQuotasFilters,
  getQuotaVisibilityFilter,
} from 'src/features/Account/Quotas/utils';

import type { Filter, QuotaType } from '@linode/api-v4';

interface Props {
  collectionName: string;
  enabled: boolean;
  selectedLocation: string;
  selectedService: QuotaType;
}

export const useGetQuotas = ({
  selectedLocation,
  selectedService,
  collectionName,
  enabled = true,
}: Props) => {
  const filters: Filter = getQuotasFilters({
    location: { label: '', value: selectedLocation },
    service: { label: '', value: selectedService },
  });

  const visiblityFilter = getQuotaVisibilityFilter(selectedService);
  const quotaMapper = getQuotaMapper(selectedService);

  const {
    data: quotas,
    error: quotasError,
    isError: isQuotasError,
    isFetching: isFetchingQuotas,
  } = useAllQuotasQuery(selectedService, collectionName, {}, filters, enabled);

  // Quota Usage Queries
  // For each quota with has_usage == true,
  // fetch the usage in parallel
  // This will only fetch for the paginated set
  const quotaIdsHavingUsage =
    quotas
      ?.filter(
        (quota) => quota.has_usage === true || quota.has_usage === undefined
      )
      .map((quota) => quota.quota_id) ?? [];
  const quotaUsageQueries = useQueries({
    queries: quotaIdsHavingUsage.map((quotaId) =>
      quotaQueries.service(selectedService, collectionName)._ctx.usage(quotaId)
    ),
  });

  // Combine the quotas with their usage
  const filteredQuotasWithUsage = React.useMemo(
    () =>
      quotas
        ?.filter((quota) => visiblityFilter.isVisible(quota))
        .map((quota, index) =>
          quotaMapper.mapQuota(quota, quotaUsageQueries?.[index]?.data || null)
        ) ?? [],
    [quotas, quotaUsageQueries]
  );

  return {
    data: filteredQuotasWithUsage,
    queries: quotaUsageQueries,
    errorMessage:
      (quotasError && quotasError[0]?.reason) ||
      quotaUsageQueries.find((query) => query.isError)?.error.message,
    isError: isQuotasError || quotaUsageQueries.some((query) => query.isError),
    isFetching:
      isFetchingQuotas || quotaUsageQueries.some((query) => query.isFetching),
  };
};

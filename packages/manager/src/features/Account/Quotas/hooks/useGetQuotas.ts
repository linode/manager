import { quotaQueries, useQueries, useQuotasQuery } from '@linode/queries';
import * as React from 'react';

import {
  getQuotasFilters,
  getQuotaVisibilityFilter,
} from 'src/features/Account/Quotas/utils';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import type { Filter, QuotaType } from '@linode/api-v4';
import type { ToSubOptions } from '@tanstack/react-router';

export const useGetQuotas = (
  selectedLocation: string,
  selectedService: QuotaType,
  currentRoute: ToSubOptions['to'],
  paginationPreferenceKey: string,
  collectionName: string,
  enabled = true
) => {
  const pagination = usePaginationV2({
    currentRoute,
    initialPage: 1,
    preferenceKey: paginationPreferenceKey,
  });

  const filters: Filter = getQuotasFilters({
    location: { label: '', value: selectedLocation },
    service: { label: '', value: selectedService },
  });

  const visiblityFilter = getQuotaVisibilityFilter(selectedService);

  const {
    data: quotas,
    error: quotasError,
    isError: isQuotasError,
    isFetching: isFetchingQuotas,
  } = useQuotasQuery(
    selectedService,
    collectionName,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filters,
    enabled
  );

  // Quota Usage Queries
  // For each quota with has_usage == true,
  // fetch the usage in parallel
  // This will only fetch for the paginated set
  const quotaIdsHavingUsage =
    quotas?.data
      .filter(
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
      quotas?.data
        .filter((quota) => visiblityFilter.isVisible(quota))
        .map((quota, index) => ({
          ...quota,
          usage: quotaUsageQueries?.[index]?.data,
        })) ?? [],
    [quotas, quotaUsageQueries]
  );

  return {
    data: filteredQuotasWithUsage,
    quotas,
    queries: quotaUsageQueries,
    errorMessage:
      (quotasError && quotasError[0]?.reason) ||
      quotaUsageQueries.find((query) => query.isError)?.error.message,
    isError: isQuotasError || quotaUsageQueries.some((query) => query.isError),
    isFetching:
      isFetchingQuotas || quotaUsageQueries.some((query) => query.isFetching),
    pagination,
  };
};

import { quotaQueries, useQueries, useQuotasQuery } from '@linode/queries';
import { useFlags } from 'launchdarkly-react-client-sdk';
import * as React from 'react';

import { getQuotasFilters } from 'src/features/Account/Quotas/utils';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import type { Filter } from '@linode/api-v4';

const SERVICE = 'object-storage';

export const useGetObjUsagePerEndpoint = (selectedLocation: string) => {
  const flags = useFlags();

  const pagination = usePaginationV2({
    currentRoute: flags?.iamRbacPrimaryNavChanges
      ? '/quotas'
      : '/account/quotas',
    initialPage: 1,
    preferenceKey: 'quotas-table',
  });

  const filters: Filter = getQuotasFilters({
    location: { label: '', value: selectedLocation },
    service: { label: '', value: SERVICE },
  });

  const {
    data: quotas,
    isError: isQuotasError,
    isFetching: isFetchingQuotas,
  } = useQuotasQuery(
    SERVICE,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filters,
    Boolean(selectedLocation)
  );

  // Quota Usage Queries
  // For each quota, fetch the usage in parallel
  // This will only fetch for the paginated set
  const quotaIds = quotas?.data.map((quota) => quota.quota_id) ?? [];
  const quotaUsageQueries = useQueries({
    queries: quotaIds.map((quotaId) =>
      quotaQueries.service(SERVICE)._ctx.usage(quotaId)
    ),
  });

  // Combine the quotas with their usage
  const quotaWithUsage = React.useMemo(
    () =>
      quotas?.data.map((quota, index) => ({
        ...quota,
        usage: quotaUsageQueries?.[index]?.data,
      })) ?? [],
    [quotas, quotaUsageQueries]
  );

  return {
    data: quotaWithUsage,
    isError: isQuotasError || quotaUsageQueries.some((query) => query.isError),
    isFetching:
      isFetchingQuotas || quotaUsageQueries.some((query) => query.isFetching),
  };
};

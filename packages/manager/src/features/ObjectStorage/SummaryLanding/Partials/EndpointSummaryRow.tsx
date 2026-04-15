import { Typography, useTheme } from '@linode/ui';
import * as React from 'react';

import { QuotaUsageBar } from 'src/components/QuotaUsageBar/QuotaUsageBar';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { useQuotasWithUsageQuery } from 'src/features/Account/Quotas/hooks/useQuotasWithUsageQuery';
import { objectStorageQuotaService } from 'src/features/Account/Quotas/quotaServices';

import type { ObjectStorageEndpointQuota } from '@linode/api-v4';
import type { QuotaWithUsage } from 'src/features/Account/Quotas/utils';

interface Props {
  endpoint: string;
}

export const EndpointSummaryRow = ({ endpoint }: Props) => {
  const theme = useTheme();
  const service = objectStorageQuotaService();

  const {
    data: quotasWithUsage,
    isFetching: isFetchingQuotas,
    isError,
  } = useQuotasWithUsageQuery({
    service,
    scope: 'obj-endpoint',
    scopeValue: endpoint,
    enabled: Boolean(endpoint),
  });

  if (
    isFetchingQuotas ||
    quotasWithUsage?.some((quotaWithUsage) => quotaWithUsage.isFetchingUsage)
  ) {
    return <TableRowLoading columns={3} />;
  }

  if (isError) {
    return (
      <TableRowError
        colSpan={3}
        message={`There was an error retrieving ${endpoint} endpoint data.`}
      />
    );
  }

  const quotasByType = quotasWithUsage.reduce(
    (acc, quotaWithUsage) => {
      acc[(quotaWithUsage.quota as ObjectStorageEndpointQuota).quota_type] =
        quotaWithUsage;
      return acc;
    },
    {} as Record<ObjectStorageEndpointQuota['quota_type'], QuotaWithUsage>
  );

  const displayedTypes: ObjectStorageEndpointQuota['quota_type'][] = [
    'obj-bytes',
    'obj-objects',
    'obj-buckets',
  ];

  return (
    <TableRow>
      {displayedTypes.map((queryType) => {
        const quotaWithUsage = quotasByType[queryType];
        return (
          <TableCell
            key={queryType}
            sx={{ paddingY: theme.spacingFunction(8) }}
          >
            <Typography>{endpoint}</Typography>

            {quotaWithUsage && !quotaWithUsage.fetchingUsageFailed ? (
              <QuotaUsageBar
                limit={quotaWithUsage.quota.quota_limit}
                resourceMetric={quotaWithUsage.quota.resource_metric}
                usage={quotaWithUsage.usage ?? 0}
              />
            ) : (
              <Typography>Data not available</Typography>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

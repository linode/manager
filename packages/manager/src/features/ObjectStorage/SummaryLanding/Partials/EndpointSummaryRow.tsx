import { Typography, useTheme } from '@linode/ui';
import * as React from 'react';

import { QuotaUsageBar } from 'src/components/QuotaUsageBar/QuotaUsageBar';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import { useGetObjUsagePerEndpoint } from '../hooks/useGetObjUsagePerEndpoint';

interface Props {
  endpoint: string;
}

export const EndpointSummaryRow = ({ endpoint }: Props) => {
  const theme = useTheme();

  const {
    data: quotaWithUsage,
    isFetching,
    isError,
  } = useGetObjUsagePerEndpoint(endpoint);

  if (isFetching) {
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

  const capacityQuota = quotaWithUsage.find(
    (quota) => quota.quota_name === 'Total Capacity'
  );
  const objectsQuota = quotaWithUsage.find(
    (quota) => quota.quota_name === 'Number of Objects'
  );
  const bucketsQuota = quotaWithUsage.find(
    (quota) => quota.quota_name === 'Number of Buckets'
  );

  return (
    <TableRow>
      {!!capacityQuota && (
        <TableCell sx={{ paddingY: theme.spacingFunction(8) }}>
          <Typography>{endpoint}</Typography>
          <QuotaUsageBar
            limit={capacityQuota.quota_limit}
            resourceMetric={capacityQuota.resource_metric}
            usage={capacityQuota?.usage?.usage ?? 0}
          />
        </TableCell>
      )}
      {!!objectsQuota && (
        <TableCell sx={{ paddingY: theme.spacingFunction(8) }}>
          <Typography>{endpoint}</Typography>
          <QuotaUsageBar
            limit={objectsQuota.quota_limit}
            resourceMetric={objectsQuota.resource_metric}
            usage={objectsQuota?.usage?.usage ?? 0}
          />
        </TableCell>
      )}
      {!!bucketsQuota && (
        <TableCell sx={{ paddingY: theme.spacingFunction(8) }}>
          <Typography>{endpoint}</Typography>
          <QuotaUsageBar
            limit={bucketsQuota.quota_limit}
            resourceMetric={bucketsQuota.resource_metric}
            usage={bucketsQuota?.usage?.usage ?? 0}
          />
        </TableCell>
      )}
    </TableRow>
  );
};

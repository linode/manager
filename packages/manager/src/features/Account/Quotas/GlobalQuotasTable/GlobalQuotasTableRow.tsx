import { Box, TooltipIcon, Typography } from '@linode/ui';
import React from 'react';

import { QuotaUsageBar } from 'src/components/QuotaUsageBar/QuotaUsageBar';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableRow } from 'src/components/TableRow/TableRow';

import { convertResourceMetric, pluralizeMetric } from '../utils';

import type { Quota, QuotaUsage } from '@linode/api-v4';

interface GlobalQuotaWithUsage extends Quota {
  usage?: QuotaUsage;
}
interface Params {
  globalQuota: GlobalQuotaWithUsage;
}

const quotaRowMinHeight = 58;

export const GlobalQuotasTableRow = ({ globalQuota }: Params) => {
  const { convertedLimit, convertedResourceMetric } = convertResourceMetric({
    initialResourceMetric: pluralizeMetric(
      globalQuota.quota_limit,
      globalQuota.resource_metric
    ),
    initialUsage: globalQuota.usage?.usage ?? 0,
    initialLimit: globalQuota.quota_limit,
  });

  return (
    <TableRow sx={{ height: quotaRowMinHeight }}>
      <TableCell>
        <Box alignItems="center" display="flex" flexWrap="nowrap">
          <Typography
            sx={{
              whiteSpace: 'nowrap',
            }}
          >
            {globalQuota.quota_name}
          </Typography>
          <TooltipIcon
            placement="top"
            status="info"
            sxTooltipIcon={{
              position: 'relative',
              top: -2,
            }}
            text={globalQuota.description}
            tooltipPosition="right"
          />
        </Box>
      </TableCell>

      <TableCell>
        {convertedLimit?.toLocaleString() ?? 'unknown'}{' '}
        {convertedResourceMetric}
      </TableCell>

      <TableCell>
        <Box sx={{ maxWidth: '80%' }}>
          {globalQuota.usage?.usage ? (
            <QuotaUsageBar
              limit={globalQuota.quota_limit}
              resourceMetric={globalQuota.resource_metric}
              usage={globalQuota.usage.usage}
            />
          ) : (
            <Typography>n/a</Typography>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};

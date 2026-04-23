import { Box, CircleProgress, TooltipIcon, Typography } from '@linode/ui';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { QuotaUsageBar } from 'src/components/QuotaUsageBar/QuotaUsageBar';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableRow } from 'src/components/TableRow/TableRow';
import { useFlags } from 'src/hooks/useFlags';
import { useIsAkamaiAccount } from 'src/hooks/useIsAkamaiAccount';

import { convertResourceMetric } from '../utils';

import type { QuotaWithUsage } from '../utils';
import type { Quota } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface QuotasTableRowProps {
  quotaRowMinHeight: number;
  quotaWithUsage: QuotaWithUsage;
  setConvertedResourceMetrics: (resourceMetric: {
    limit: number;
    metric: string;
  }) => void;
  setSelectedQuota: (quota: Quota) => void;
  setSupportModalOpen: (open: boolean) => void;
}

export const QuotasTableRow = (props: QuotasTableRowProps) => {
  const {
    quotaWithUsage,
    quotaRowMinHeight,
    setSelectedQuota,
    setSupportModalOpen,
    setConvertedResourceMetrics,
  } = props;
  const flags = useFlags();
  const { isAkamaiAccount } = useIsAkamaiAccount();
  // These conditions are meant to achieve a couple of things:
  // 1. Ability to disable the request for increase button for Internal accounts (this will be used for early adopters, and removed eventually).
  // 2. Ability to disable the request for increase button for All accounts (this is a prevention measure when beta is in GA).
  const isRequestForQuotaButtonDisabled =
    flags.limitsEvolution?.requestForIncreaseDisabledForAll ||
    (flags.limitsEvolution?.requestForIncreaseDisabledForInternalAccountsOnly &&
      isAkamaiAccount);

  const quota = quotaWithUsage.quota;

  const { convertedLimit, convertedResourceMetric } = convertResourceMetric({
    initialResourceMetric: quota.resource_metric,
    initialUsage: quotaWithUsage.usage ?? 0,
    initialLimit: quota.quota_limit,
  });

  const requestIncreaseAction: Action = {
    disabled: isRequestForQuotaButtonDisabled,
    onClick: () => {
      setSelectedQuota(quotaWithUsage.quota);
      setSupportModalOpen(true);
      setConvertedResourceMetrics({
        limit: Number(convertedLimit),
        metric: convertedResourceMetric,
      });
    },
    title: 'Request Increase',
  };

  return (
    <TableRow key={quota.quota_id} sx={{ height: quotaRowMinHeight }}>
      <TableCell>
        <Box alignItems="center" display="flex" flexWrap="nowrap">
          <Typography
            sx={{
              whiteSpace: 'nowrap',
            }}
          >
            {quota.quota_name}
          </Typography>
          <TooltipIcon
            placement="top"
            status="info"
            sxTooltipIcon={{
              position: 'relative',
              top: -2,
            }}
            text={quota.description}
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
          {quotaWithUsage.isFetchingUsage ? (
            <Box alignItems="center" display="flex" gap={1}>
              <CircleProgress size="sm" />{' '}
              <Typography>Fetching data...</Typography>
            </Box>
          ) : quotaWithUsage.fetchingUsageFailed ? (
            <Typography
              sx={{
                alignItems: 'center',
                display: 'flex',
                gap: 1,
                lineHeight: 1,
              }}
            >
              <TooltipIcon
                status="warning"
                sxTooltipIcon={{ padding: `0px 0px` }}
                text={
                  quotaWithUsage.usageFetchErrorMessage ??
                  'An unexpected error occurred.'
                }
              />
              Failed to fetch data
            </Typography>
          ) : quotaWithUsage.usage !== null ? (
            <QuotaUsageBar
              limit={quota.quota_limit}
              resourceMetric={quota.resource_metric}
              usage={quotaWithUsage.usage}
            />
          ) : quotaWithUsage.hasUsage ? (
            <Typography>Data not available</Typography>
          ) : (
            <Typography>Not applicable</Typography>
          )}
        </Box>
      </TableCell>

      <TableCell sx={{ paddingRight: 0, textAlign: 'right' }}>
        <ActionMenu
          actionsList={[requestIncreaseAction]}
          ariaLabel={`Action menu for quota ${quota.quota_name}`}
        />
      </TableCell>
    </TableRow>
  );
};

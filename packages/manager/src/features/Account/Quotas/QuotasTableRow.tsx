import { Box, CircleProgress, TooltipIcon, Typography } from '@linode/ui';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { QuotaUsageBar } from 'src/components/QuotaUsageBar/QuotaUsageBar';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableRow } from 'src/components/TableRow/TableRow';
import { useFlags } from 'src/hooks/useFlags';
import { useIsAkamaiAccount } from 'src/hooks/useIsAkamaiAccount';

import { convertResourceMetric, getQuotaError, pluralizeMetric } from './utils';

import type { Quota, QuotaUsage } from '@linode/api-v4';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface QuotaWithUsage extends Quota {
  usage?: QuotaUsage;
}

interface QuotasTableRowProps {
  hasQuotaUsage: boolean;
  index: number;
  quota: QuotaWithUsage;
  quotaUsageQueries: UseQueryResult<QuotaUsage, Error>[];
  setConvertedResourceMetrics: (resourceMetric: {
    limit: number;
    metric: string;
  }) => void;
  setSelectedQuota: (quota: Quota) => void;
  setSupportModalOpen: (open: boolean) => void;
}

const quotaRowMinHeight = 58;

export const QuotasTableRow = (props: QuotasTableRowProps) => {
  const {
    hasQuotaUsage,
    index,
    quota,
    quotaUsageQueries,
    setSelectedQuota,
    setSupportModalOpen,
    setConvertedResourceMetrics,
  } = props;
  const flags = useFlags();
  const { isAkamaiAccount } = useIsAkamaiAccount();
  // These conditions are meant to achieve a couple things:
  // 1. Ability to disable the request for increase button for Internal accounts (this will be used for early adopters, and removed eventually).
  // 2. Ability to disable the request for increase button for All accounts (this is a prevention measure when beta is in GA).
  const isRequestForQuotaButtonDisabled =
    flags.limitsEvolution?.requestForIncreaseDisabledForAll ||
    (flags.limitsEvolution?.requestForIncreaseDisabledForInternalAccountsOnly &&
      isAkamaiAccount);

  const { convertedLimit, convertedResourceMetric } = convertResourceMetric({
    initialResourceMetric: pluralizeMetric(
      quota.quota_limit,
      quota.resource_metric
    ),
    initialUsage: quota.usage?.usage ?? 0,
    initialLimit: quota.quota_limit,
  });

  const requestIncreaseAction: Action = {
    disabled: isRequestForQuotaButtonDisabled,
    onClick: () => {
      setSelectedQuota(quota);
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
          {quotaUsageQueries[index]?.isLoading ? (
            <Box alignItems="center" display="flex" gap={1}>
              <CircleProgress size="sm" />{' '}
              <Typography>Fetching Data...</Typography>
            </Box>
          ) : quotaUsageQueries[index]?.error ? (
            <Typography
              sx={{
                alignItems: 'center',
                display: 'flex',
                gap: 1,
                lineHeight: 1,
              }}
            >
              <ErrorOutline />
              {getQuotaError(quotaUsageQueries, index)}
            </Typography>
          ) : hasQuotaUsage ? (
            <QuotaUsageBar
              limit={quota.quota_limit}
              resourceMetric={quota.resource_metric}
              usage={quota.usage?.usage ?? 0}
            />
          ) : (
            <Typography>Data not available</Typography>
          )}
        </Box>
      </TableCell>
      {hasQuotaUsage ? (
        <TableCell sx={{ paddingRight: 0, textAlign: 'right' }}>
          <ActionMenu
            actionsList={[requestIncreaseAction]}
            ariaLabel={`Action menu for quota ${quota.quota_name}`}
          />
        </TableCell>
      ) : (
        <TableCell />
      )}
    </TableRow>
  );
};

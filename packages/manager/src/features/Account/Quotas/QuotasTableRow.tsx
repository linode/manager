import { Box, CircleProgress, TooltipIcon, Typography } from '@linode/ui';
import { readableBytes } from '@linode/utilities';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { BarPercent } from 'src/components/BarPercent/BarPercent';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableRow } from 'src/components/TableRow/TableRow';
import { useFlags } from 'src/hooks/useFlags';
import { useIsAkamaiAccount } from 'src/hooks/useIsAkamaiAccount';

import { getQuotaError } from './utils';

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
  const theme = useTheme();
  const flags = useFlags();
  const { isAkamaiAccount } = useIsAkamaiAccount();
  // These conditions are meant to achieve a couple things:
  // 1. Ability to disable the request for increase button for Internal accounts (this will be used for early adopters, and removed eventually).
  // 2. Ability to disable the request for increase button for All accounts (this is a prevention measure when beta is in GA).
  const isRequestForQuotaButtonDisabled =
    flags.limitsEvolution?.requestForIncreaseDisabledForAll ||
    (flags.limitsEvolution?.requestForIncreaseDisabledForInternalAccountsOnly &&
      isAkamaiAccount);

  const convertResourceMetric = ({
    initialResourceMetric,
    initialUsage,
    initialLimit,
  }: {
    initialLimit: number;
    initialResourceMetric: string;
    initialUsage: number;
  }): {
    convertedLimit: number;
    convertedResourceMetric: string;
    convertedUsage: number;
  } => {
    if (initialResourceMetric === 'byte') {
      const limitReadable = readableBytes(initialLimit);

      return {
        convertedUsage: readableBytes(initialUsage, {
          unit: limitReadable.unit,
        }).value,
        convertedResourceMetric: limitReadable.unit,
        convertedLimit: limitReadable.value,
      };
    }

    return {
      convertedUsage: initialUsage,
      convertedLimit: initialLimit,
      convertedResourceMetric: initialResourceMetric,
    };
  };

  const pluralizeMetric = (value: number, unit: string) => {
    if (unit !== 'byte') {
      return value > 1 ? `${unit}s` : unit;
    }

    return unit;
  };

  const { convertedUsage, convertedLimit, convertedResourceMetric } =
    convertResourceMetric({
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
        limit: convertedLimit,
        metric: convertedResourceMetric,
      });
    },
    title: 'Request an Increase',
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
            status="help"
            sxTooltipIcon={{
              position: 'relative',
              top: -2,
            }}
            text={quota.description}
          />
        </Box>
      </TableCell>
      <TableCell>
        {convertedLimit} {convertedResourceMetric}
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
            <>
              <BarPercent
                customColors={[
                  {
                    color: theme.tokens.color.Red[80],
                    percentage: 81,
                  },
                  {
                    color: theme.tokens.color.Orange[80],
                    percentage: 61,
                  },
                  {
                    color: theme.tokens.color.Brand[80],
                    percentage: 1,
                  },
                ]}
                max={quota.quota_limit}
                rounded
                sx={{ mb: 1, mt: 2, padding: '3px' }}
                value={quota.usage?.usage ?? 0}
              />
              <Typography sx={{ mb: 1 }}>
                {`${convertedUsage} of ${convertedLimit} ${
                  convertedResourceMetric
                } used`}
              </Typography>
            </>
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

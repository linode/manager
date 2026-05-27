import { Typography, useTheme } from '@linode/ui';
import * as React from 'react';

import { BarPercent } from 'src/components/BarPercent';
import { convertResourceMetric } from 'src/features/Account/Quotas/utils';

import type { Quota } from '@linode/api-v4';

interface Props {
  limit: number;
  resourceMetric: Quota['resource_metric'];
  usage: number;
  variant: 'obj-summary' | 'quotas';
}

export const QuotaUsageBar = ({
  limit,
  usage,
  resourceMetric,
  variant,
}: Props) => {
  const theme = useTheme();

  const isSummary = variant === 'obj-summary';

  const { convertedUsage, convertedLimit, convertedResourceMetric } =
    convertResourceMetric({
      initialResourceMetric: resourceMetric,
      initialUsage: usage,
      initialLimit: limit,
    });

  function getUsageText() {
    let convertedUsageString = convertedUsage.toLocaleString();
    const convertedLimitString = convertedLimit.toLocaleString();

    // Special case to display storage usage
    if (convertedUsage === 0 && usage > 0) {
      // assumes that the minimum converted non-zero value is expressed with an accuracy of 2 decimal places
      convertedUsageString = '<0.01';
    }

    return `${convertedUsageString} of ${convertedLimitString} ${convertedResourceMetric} used`;
  }

  return (
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
            color: isSummary
              ? theme.tokens.color.Gradient.Default
              : theme.tokens.color.Brand[80],
            percentage: 1,
          },
        ]}
        max={limit}
        rounded={isSummary ? false : true}
        sx={{
          mb: 0.5,
          mt: isSummary ? 0.5 : 2,
          padding: isSummary ? '4px' : '3px',
          margin: 0,
        }}
        value={usage}
      />
      <Typography
        sx={(theme) => ({
          mt: theme.spacingFunction(8),
          font: isSummary
            ? theme.tokens.alias.Typography.Label.Bold.S
            : theme.tokens.alias.Typography.Label.Regular.S,
        })}
        variant={'subtitle2'}
      >
        {getUsageText()}
      </Typography>
    </>
  );
};

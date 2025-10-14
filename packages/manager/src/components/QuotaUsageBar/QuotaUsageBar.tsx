import { Typography, useTheme } from '@linode/ui';
import * as React from 'react';

import { BarPercent } from 'src/components/BarPercent';
import {
  convertResourceMetric,
  pluralizeMetric,
} from 'src/features/Account/Quotas/utils';

interface Props {
  limit: number;
  resourceMetric: string;
  usage: number;
}

export const QuotaUsageBar = ({ limit, usage, resourceMetric }: Props) => {
  const theme = useTheme();

  const { convertedUsage, convertedLimit, convertedResourceMetric } =
    convertResourceMetric({
      initialResourceMetric: pluralizeMetric(limit, resourceMetric),
      initialUsage: usage,
      initialLimit: limit,
    });

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
            color: theme.tokens.color.Brand[80],
            percentage: 1,
          },
        ]}
        max={limit}
        rounded
        sx={{ mb: 1, mt: 2, padding: '3px' }}
        value={usage}
      />
      <Typography sx={{ mb: 1, mt: -0.5 }}>
        {`${convertedUsage?.toLocaleString() ?? 'unknown'} of ${
          convertedLimit?.toLocaleString() ?? 'unknown'
        } ${convertedResourceMetric} used`}
      </Typography>
    </>
  );
};

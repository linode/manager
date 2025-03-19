import { Box, Chip, Tooltip, Typography } from '@linode/ui';
import React from 'react';

import type { ProcessedCriteria } from '../Utils/utils';

export interface MetricThresholdProps {
  /**
   * List of processed criterias
   */
  metricThreshold: ProcessedCriteria[];
}

export const MetricThreshold = (props: MetricThresholdProps) => {
  const { metricThreshold } = props;
  if (metricThreshold.length === 0) {
    return (
      <Typography
        sx={(theme) => ({
          font: theme.tokens.alias.Typography.Label.Regular.S,
        })}
      >
        -
      </Typography>
    );
  }

  const thresholdObject = metricThreshold[0];
  const metric = `${thresholdObject.label} ${thresholdObject.metricOperator}  ${thresholdObject.threshold} ${thresholdObject.unit}`;
  const total = metricThreshold.length - 1;
  if (metricThreshold.length === 1) {
    return (
      <Typography
        sx={(theme) => ({
          font: theme.tokens.alias.Typography.Label.Regular.S,
        })}
      >
        {metric}
      </Typography>
    );
  }
  const rest = metricThreshold
    .slice(1)
    .map((criteria) => {
      return `${criteria.label} ${criteria.metricOperator} ${criteria.threshold} ${criteria.unit}`;
    })
    .join('\n');
  return (
    <Box alignItems="center" display="flex" gap={1.75}>
      <Typography
        sx={(theme) => ({
          font: theme.tokens.alias.Typography.Label.Regular.S,
        })}
      >
        {metric}
      </Typography>
      <Tooltip
        title={<Typography sx={{ whiteSpace: 'pre-line' }}>{rest}</Typography>}
      >
        <span>
          <Chip
            sx={(theme) => ({
              backgroundColor: theme.color.tagButtonBg,
              color: theme.color.tagButtonText,
              px: 0.5,
              py: 1.5,
            })}
            label={`+${total}`}
          />
        </span>
      </Tooltip>
    </Box>
  );
};

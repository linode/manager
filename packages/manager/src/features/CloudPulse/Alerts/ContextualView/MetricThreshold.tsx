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
    return <Typography variant="body2">-</Typography>;
  }

  const thresholdObject = metricThreshold[0];
  const metric = `${thresholdObject.label} ${thresholdObject.operator}  ${thresholdObject.threshold} ${thresholdObject.unit}`;
  const total = metricThreshold.length - 1;
  if (metricThreshold.length === 1) {
    return <Typography variant="subtitle1">{metric}</Typography>;
  }
  const rest = metricThreshold
    .slice(1)
    .map((criteria) => {
      return `${criteria.label} ${criteria.operator} ${criteria.threshold} ${criteria.unit}`;
    })
    .join('\n');
  return (
    <Box alignItems="center" display="flex" gap={1.75}>
      <Typography variant="subtitle1">{metric}</Typography>
      <Tooltip
        title={<Typography sx={{ whiteSpace: 'pre-line' }}>{rest}</Typography>}
      >
        <span>
          <Chip
            sx={(theme) => {
              return {
                backgroundColor: theme.color.tagButtonBg,
                color: theme.color.tagButtonText,
                px: 0.5,
                py: 1.5,
              };
            }}
            color="primary"
            label={`+${total}`}
            variant="outlined"
          />
        </span>
      </Tooltip>
    </Box>
  );
};

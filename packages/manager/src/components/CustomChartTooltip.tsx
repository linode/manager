// Default tooltip content + its wrapper Paper, shared between AreaChart and BarChart.
import { Box, Paper, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import {
  tooltipLabelFormatter,
  tooltipValueFormatter,
} from '../components/AreaChart/utils';

import type { CustomTooltipProps } from './chartTypes';

export const StyledTooltipPaper = styled(Paper, {
  label: 'StyledTooltipPaper',
})(({ theme }) => ({
  border: `1px solid ${theme.color.border2}`,
  padding: theme.spacingFunction(8),
}));

export const CustomChartTooltip = React.memo(
  ({
    active,
    label,
    payload,
    timezone,
    tooltipCustomValueFormatter,
    unit,
    tooltipRef,
  }: CustomTooltipProps) => {
    if (active && payload && payload.length && typeof label === 'number') {
      return (
        <StyledTooltipPaper ref={tooltipRef}>
          <Typography>{tooltipLabelFormatter(label, timezone)}</Typography>
          {payload.map((item) => {
            if (
              (typeof item.dataKey !== 'string' &&
                typeof item.dataKey !== 'number') ||
              typeof item.value !== 'number'
            ) {
              return null;
            }

            return (
              <Box
                display="flex"
                justifyContent="space-between"
                key={item.dataKey}
              >
                <Typography
                  sx={(theme) => ({
                    font: theme.font.bold,
                  })}
                >
                  {item.dataKey}
                </Typography>
                <Typography
                  marginLeft={2}
                  sx={(theme) => ({
                    font: theme.font.bold,
                  })}
                >
                  {tooltipCustomValueFormatter
                    ? tooltipCustomValueFormatter(item.value, unit)
                    : tooltipValueFormatter(item.value, unit)}
                </Typography>
              </Box>
            );
          })}
        </StyledTooltipPaper>
      );
    }

    return null;
  }
);

import { Font } from '@akamai/cds-tokens';
import {
  Box,
  CircleProgress,
  ErrorState,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';

type MetricValue = number | string;

export interface ChartData {
  /**
   * The timestamp of the data point in milliseconds since the Unix epoch.
   */
  timestamp: number;
  /**
   * The value of the data point. It can be a number or null if the value is not available.
   */
  value: null | number;
}

export interface SingleMetricChartProps {
  /**
   * The data to be displayed in the chart. Each entry should have a timestamp and a value.
   */
  chartData?: ChartData[];
  /**
   * An optional error message to display if there is an error fetching or processing the data. If provided, the chart will not be displayed, and the error message will be shown instead.
   */
  error?: string;
  /**
   * Indicates whether the chart is currently loading data. If true, a loading indicator will be displayed instead of the chart.
   */
  isLoading?: boolean;
  /**
   * The label for the chart, typically describing the metric being displayed (e.g., "CPU Usage").
   */
  label: string;
  /**
   * An optional label indicating the period over which the data is aggregated (e.g., "Last 24 Hours"). If not provided, no period label will be displayed.
   */
  periodLabel?: string;
  /**
   * The aggregate value to be displayed prominently in the chart. This is typically a summary statistic (e.g., average, maximum) of the data being visualized.
   */
  value: MetricValue;
}

export const SingleKpiChart = ({
  isLoading = false,
  label,
  periodLabel,
  value,
  chartData,
  error,
}: SingleMetricChartProps) => {
  if (error || isLoading) {
    return (
      <Paper
        sx={{
          alignItems: 'center',
          borderWidth: 0,
          boxSizing: 'border-box',
          display: 'flex',
          height: '150px',
          maxHeight: '150px',
          overflow: 'hidden',
          p: 2,
          position: 'relative',
        }}
        variant="outlined"
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {error && (
            <ErrorState
              compact
              CustomIconStyles={{
                height: 24,
                width: 24,
              }}
              errorText={error}
              typographySx={{
                fontSize: '14px',
                lineHeight: 1.3,
              }}
            />
          )}
          {isLoading && <CircleProgress size="md" />}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        borderWidth: 0,
        boxSizing: 'border-box',
        height: '150px',
        maxHeight: '150px',
        overflow: 'hidden',
        p: {
          xs: '8px 48px 8px 48px',
          md: '16px 16px 0px 16px',
        },
        position: 'relative',
      }}
      variant="outlined"
    >
      <Stack
        gap={0.5}
        sx={{
          height: '100%',
          justifyContent: 'space-between',
          opacity: isLoading ? 0 : 1,
          transition: `opacity 600ms ease`,
        }}
      >
        <Box>
          <Typography
            sx={(theme) => ({
              color: theme.tokens.alias.Content.Text.Secondary.Default,
              font: theme.font.normal,
              fontSize: Font.FontSize.Xs,
            })}
            variant="h3"
          >
            {label}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 'fit-content',
          }}
        >
          <Typography
            sx={(theme) => ({
              color: theme.tokens.alias.Content.Text.Primary.Default,
              font: theme.font.bold,
              fontSize: Font.FontSize.Xl,
              letterSpacing: '-0.03em',
            })}
          >
            {value}
          </Typography>
        </Box>

        <Typography
          sx={(theme) => ({
            color: theme.tokens.alias.Content.Text.Secondary.Default,
            font: theme.font.normal,
            fontSize: Font.FontSize.Xxxs,
            paddingLeft: '1px',
          })}
          variant="body1"
        >
          {periodLabel}
        </Typography>

        {chartData && chartData.length > 0 && (
          <Box
            aria-label={`single-metric-chart-container - ${label}`}
            sx={{ height: 50, width: '100%' }}
          >
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={chartData}>
                <YAxis domain={['dataMin - 0.05', 'dataMax + 0.05']} hide />
                <Area
                  activeDot={false}
                  dataKey="value"
                  dot={false}
                  fill="#4067E5"
                  fillOpacity={0.3}
                  strokeWidth={1}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

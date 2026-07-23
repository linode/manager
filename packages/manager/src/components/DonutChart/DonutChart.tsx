import { Alias } from '@linode/design-language-system';
import { Box, CircleProgress, Paper, Stack, Typography } from '@linode/ui';
import { replaceNewlinesWithLineBreaks } from '@linode/utilities';
import { keyframes, useTheme } from '@mui/material/styles';
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { DonutChartLegend } from './DonutChartLegend';
import { DonutChartTooltip } from './DonutChartTooltip';

export type DonutChartDatum = {
  id: string;
  label: string;
  value: number;
  value1?: number | string;
  value2?: number | string;
};

type PieChartMargin = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

export type DonutChartProps = {
  centerLabel: string;
  colorPalette?: string[];
  data: DonutChartDatum[];
  donutInnerRadius?: number;
  donutOuterRadius?: number;
  height?: number;
  isLoading?: boolean;
  legendColumnProportions?: number[];
  legendRows?: number;
  legendValueFormatOptions?: {
    locale?: string | string[];
    value?: Intl.NumberFormatOptions;
    value1?: Intl.NumberFormatOptions;
    value2?: Intl.NumberFormatOptions;
  };
  periodLabel: string;
  pieChartMargin?: PieChartMargin;
  pieChartStyle?: React.CSSProperties;
  pieContainerWidth?: number;
  pieCx?: number | string;
  pieCy?: number | string;
  seriesColorIndices?: Record<string, number>;
  tooltipAnimationDuration?: number;
  valueFormatter?: (value: number) => string;
};

const DEFAULT_COLORS = Object.values(Alias.Chart.Categorical).map(
  (categoricalColor) => categoricalColor.Primary
);
const LOADING_TIMEOUT_MS = 15_000;
const LOADING_TRANSITION_DURATION_MS = 600;
const NO_DATA_FADE_IN_DELAY_MS = 400;
const NO_DATA_FADE_IN_DURATION_MS = 500;
const LEGEND_ROW_HEIGHT_PX = 28;
const LEGEND_ROW_GAP_PX = 8;

const noDataFadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const defaultValueFormatter = (value: number) => {
  // Format large numbers with abbreviations (K, M, B)
  if (value >= 1_000_000_000) {
    const formatted = value / 1_000_000_000;
    return formatted % 1 === 0 ? `${formatted}B` : `${formatted.toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    const formatted = value / 1_000_000;
    return formatted % 1 === 0 ? `${formatted}M` : `${formatted.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const formatted = value / 1_000;
    return formatted % 1 === 0 ? `${formatted}K` : `${formatted.toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-US').format(value);
};

export const DonutChart = ({
  centerLabel,
  colorPalette = DEFAULT_COLORS,
  data,
  donutInnerRadius = 68,
  donutOuterRadius = 85,
  height = 203,
  isLoading = false,
  legendColumnProportions = [33.333, 33.333, 33.333],
  legendRows,
  legendValueFormatOptions,
  pieContainerWidth,
  pieChartMargin = { bottom: 0, left: 0, right: 0, top: 0 },
  pieChartStyle,
  periodLabel: _periodLabel,
  pieCx = '50%',
  pieCy = '50%',
  seriesColorIndices,
  tooltipAnimationDuration = 200,
  valueFormatter = defaultValueFormatter,
}: DonutChartProps) => {
  const theme = useTheme();
  const [hasLoadingTimedOut, setHasLoadingTimedOut] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading) {
      setHasLoadingTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHasLoadingTimedOut(true);
    }, LOADING_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoading]);

  const showSpinner = isLoading && !hasLoadingTimedOut;
  const forceNoDataState = isLoading && hasLoadingTimedOut;
  const resolvedPieContainerWidth =
    pieContainerWidth ?? Math.ceil(donutOuterRadius * 2);

  const chartData = React.useMemo(() => {
    return data
      .filter((datum) => datum.value > 0)
      .map((datum, index) => ({
        ...datum,
        color:
          colorPalette[
            (seriesColorIndices?.[datum.id] ?? index) % colorPalette.length
          ],
      }));
  }, [colorPalette, data, seriesColorIndices]);

  const total = React.useMemo(
    () => chartData.reduce((sum, datum) => sum + datum.value, 0),
    [chartData]
  );

  const hasNoDataSentinel =
    chartData.length === 1 && chartData[0]?.id === 'no-data';
  const isEmptyState =
    forceNoDataState || chartData.length === 0 || hasNoDataSentinel;
  const showNoDataOverlay = forceNoDataState || (!isLoading && isEmptyState);
  const resolvedLegendRows = Math.max(
    1,
    legendRows ?? Math.max(chartData.length, 1)
  );
  const reservedLegendHeight =
    resolvedLegendRows * LEGEND_ROW_HEIGHT_PX +
    (resolvedLegendRows - 1) * LEGEND_ROW_GAP_PX;

  const renderedPieData = React.useMemo(() => {
    if (!isEmptyState) {
      return chartData;
    }

    return [
      {
        color: theme.tokens.alias.Background.Neutralsubtle,
        id: 'no-data-render',
        label: 'No Data',
        value: 1,
      },
    ];
  }, [chartData, isEmptyState, theme.tokens.alias.Background.Neutralsubtle]);

  const legendNoDataOverlay = (
    <Box
      sx={{
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
        alignItems: 'center',
        animation: showNoDataOverlay
          ? `${noDataFadeIn} ${NO_DATA_FADE_IN_DURATION_MS}ms ease ${NO_DATA_FADE_IN_DELAY_MS}ms both`
          : 'none',
        display: 'flex',
        inset: 0,
        justifyContent: 'center',
        opacity: showNoDataOverlay ? 1 : 0,
        pointerEvents: showNoDataOverlay ? 'auto' : 'none',
        position: 'absolute',
        transition: `opacity ${LOADING_TRANSITION_DURATION_MS}ms ease`,
        zIndex: 1,
      }}
    >
      <Paper
        sx={{
          backgroundColor: theme.tokens.alias.Background.Neutralsubtle,
          borderRadius: 1.5,
          borderWidth: 0,
          px: 1.5,
          py: 0.75,
        }}
        variant="outlined"
      >
        <Typography
          sx={{
            color: theme.palette.text.secondary,
            font: theme.font.semibold,
            fontSize: 12,
          }}
        >
          No Data
        </Typography>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        sx={{
          opacity: showSpinner ? 0 : 1,
          transition: `opacity ${LOADING_TRANSITION_DURATION_MS}ms ease`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Stack
            alignItems="center"
            direction={{ sm: 'row', xs: 'column' }}
            spacing={0}
            sx={{
              margin: 0,
              maxWidth: '100%',
              padding: 0,
              width: { sm: 'fit-content', xs: '100%' },
            }}
          >
            <Box
              sx={{
                flexShrink: 0,
                height,
                minWidth: { sm: resolvedPieContainerWidth, xs: '100%' },
                position: 'relative',
                width: { sm: resolvedPieContainerWidth, xs: '100%' },
              }}
            >
              <ResponsiveContainer height="100%" width="100%">
                <PieChart margin={pieChartMargin} style={pieChartStyle}>
                  <Pie
                    cornerRadius={0}
                    cx={pieCx}
                    cy={pieCy}
                    data={renderedPieData}
                    dataKey="value"
                    innerRadius={donutInnerRadius}
                    outerRadius={donutOuterRadius}
                    paddingAngle={0}
                    stroke="none"
                  >
                    {renderedPieData.map((entry) => (
                      <Cell fill={entry.color} key={entry.id} />
                    ))}
                  </Pie>
                  <Tooltip
                    animationDuration={tooltipAnimationDuration}
                    content={(props) => (
                      <DonutChartTooltip
                        active={props.active}
                        payload={props.payload}
                        total={total}
                        valueFormatter={valueFormatter}
                      />
                    )}
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  left: pieCx,
                  pointerEvents: 'none',
                  position: 'absolute',
                  top: pieCy,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1,
                }}
              >
                <Typography
                  color="text.primary"
                  sx={{
                    lineHeight: 1.1,
                    textAlign: 'center',
                  }}
                  variant="h2"
                >
                  {replaceNewlinesWithLineBreaks(centerLabel)}
                </Typography>
              </Stack>
            </Box>

            <Box
              sx={{
                backgroundColor: 'transparent',
                flexShrink: 0,
                height: reservedLegendHeight,
                minHeight: reservedLegendHeight,
                minWidth: { sm: 250, xs: '100%' },
                position: 'relative',
                width: { sm: 'auto', xs: '100%' },
                zIndex: 0,
              }}
            >
              <DonutChartLegend
                columnProportions={legendColumnProportions}
                items={isEmptyState ? [] : chartData}
                total={total}
                valueFormatOptions={legendValueFormatOptions}
              />

              {legendNoDataOverlay}
            </Box>
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          inset: 0,
          justifyContent: 'center',
          opacity: showSpinner ? 1 : 0,
          pointerEvents: showSpinner ? 'auto' : 'none',
          position: 'absolute',
          transition: `opacity ${LOADING_TRANSITION_DURATION_MS}ms ease`,
          zIndex: 3,
        }}
      >
        <CircleProgress size="md" />
      </Box>
    </Box>
  );
};

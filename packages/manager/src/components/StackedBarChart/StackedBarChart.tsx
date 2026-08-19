import { LoadingSpinner } from '@akamai/cds-components/react/LoadingSpinner';
import { Alias } from '@linode/design-language-system';
import { Box, keyframes, Paper, Typography, useTheme } from '@linode/ui';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { StackedBarChartTooltip } from './StackedBarChartTooltip';

const LABEL_COLOR_DARK = 'hsl(220, 14%, 82%)';
const LABEL_COLOR_LIGHT = 'hsl(220, 9%, 36%)';

export type DataPoint = {
  date?: string;
  time: string;
  value: number;
  xAxisDate?: string;
};

export type DataSeries = {
  color?: string;
  id: string;
  label: string;
  values: DataPoint[];
};

export type ChartPayload = {
  series: DataSeries[];
};

export type StackedBarChartProps = {
  barAnimationDuration?: number;
  barHighlightColor?: string;
  barHoverColor?: string;
  barWidth?: number;
  data: ChartPayload;
  gridStrokeColor?: string;
  height?: number;
  isLoading?: boolean;
  legendFontSize?: number;
  legendIconSize?: number;
  legendItemSpacing?: number;
  legendLineHeight?: number;
  legendRowGap?: number;
  legendRows?: number;
  legendTextColor?: string;
  seriesColorIndices?: Record<string, number>;
  stacked?: boolean;
  stackId?: string;
  tooltipAnimationDuration?: number;
  tooltipDateTimeColor?: string;
  tooltipTitle?: string;
  valueFormatter?: (value: number) => string;
  xAxisColor?: string;
  xAxisDateFontSize?: number;
  xAxisFontSize?: number;
  xAxisInterval?: number;
  xAxisLabelColor?: string;
  yAxisColor?: string;
  yAxisFontSize?: number;
  yAxisLabelColor?: string;
};

type ThemeColor = {
  dark: string;
  light: string;
};

const FALLBACK_COLORS: string[] = Object.values(Alias.Chart.Categorical).map(
  (categoricalColor) => categoricalColor.Primary
);

const THEME_COLORS = {
  barHighlight: {
    dark: 'hsla(220, 20%, 8%, 0.2)',
    light: 'hsla(220, 18%, 22%, 0.2)',
  },
  xAxis: {
    dark: 'hsl(220, 14%, 52%)',
    light: 'hsl(220, 10%, 56%)',
  },
  xAxisLabel: {
    dark: LABEL_COLOR_DARK,
    light: LABEL_COLOR_LIGHT,
  },
  yAxis: {
    dark: 'hsl(220, 14%, 52%)',
    light: 'hsl(220, 10%, 56%)',
  },
  yAxisLabel: {
    dark: LABEL_COLOR_DARK,
    light: LABEL_COLOR_LIGHT,
  },
  gridStroke: {
    dark: 'hsl(220, 16%, 44%)',
    light: 'hsl(220, 13%, 84%)',
  },
  legendText: {
    dark: LABEL_COLOR_DARK,
    light: LABEL_COLOR_LIGHT,
  },
};

const resolveThemeColor = (
  mode: 'dark' | 'light',
  colors: ThemeColor,
  override?: string
) => {
  if (override) {
    return override;
  }

  return mode === 'light' ? colors.light : colors.dark;
};

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

const MIN_X_AXIS_LABEL_SPACING_PX = 48;
const MAX_LEGEND_COLUMNS = 5;
const MIN_LEGEND_COLUMNS = 3;
const LEGEND_FOUR_COLUMN_BREAKPOINT_PX = 960;
const LEGEND_THREE_COLUMN_BREAKPOINT_PX = 720;
const LEGEND_LABEL_MAX_WIDTH_PX = 120;
const LEGEND_LABEL_MAX_WIDTH_FIVE_COLUMNS_PX = LEGEND_LABEL_MAX_WIDTH_PX + 20;
const EMPTY_STATE_AXIS_MAX_VALUE = 1;
const LOADING_TIMEOUT_MS = 15_000;
const LOADING_TRANSITION_DURATION_MS = 600;
const NO_DATA_FADE_IN_DELAY_MS = 400;
const NO_DATA_FADE_IN_DURATION_MS = 500;
const TRANSPARENT_COLOR = 'transparent';

const noDataFadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

export const StackedBarChart = ({
  xAxisColor, // Color override  for the X-axis line. CSS color string.
  xAxisDateFontSize, // Font size for the date sub-label below each X-axis tick. Unit: px. Default: xAxisFontSize - 2.
  xAxisFontSize = 12, // Font size of X-axis tick labels. Unit: px. Default: 12.
  xAxisInterval = 1, // Interval for X-axis tick labels (e.g., 2 shows every 2nd label). Default: 1.
  xAxisLabelColor, // Color override for X-axis tick labels. CSS color string.
  yAxisColor, // Color override  for the Y-axis line. CSS color string.
  yAxisFontSize = 12, // Font size of Y-axis tick labels. Unit: px. Default: 12.
  yAxisLabelColor, // Color override  for Y-axis tick labels. CSS color string.
  barAnimationDuration = 400, // Bar entrance/update animation duration in ms. Unit: ms. Default: 400.
  barHighlightColor, // Color override for the hover highlight rectangle. CSS color string. Takes precedence over barHoverColor.
  barHoverColor, // Alias for barHighlightColor. Ignored when barHighlightColor is also set.
  barWidth, // Fixed pixel width of each bar. When omitted, Recharts sizes bars automatically. Unit: px.
  data, // Chart data: { series: [{ id, label, values: [{ time, value, date? }] }] }
  gridStrokeColor, // Color override for chart grid lines. CSS color string.
  height = 250, // Height of the chart canvas area. Unit: px. Default: 250.
  legendFontSize = 12, // Font size of legend item labels. Unit: px. Default: 12.
  legendIconSize = 12, // Width and height of each legend color swatch. Unit: px. Default: 12.
  legendItemSpacing = 23, // Horizontal gap between legend items. Unit: px. Default: 23.
  legendLineHeight = 1.3, // Line height of legend items for controlling wrap spacing. Default: 1.3.
  legendRowGap = 4, // Vertical gap between legend rows when wrapping. Unit: px. Default: 4.
  legendRows = 2, // Number of legend rows to reserve in layout. Unit: rows. Default: 2.
  legendTextColor, // Color override for legend label text. CSS color string.
  isLoading = false,
  seriesColorIndices, // Maps series id → color palette index for consistent colors across filtered views.
  stackId, // Custom Recharts stackId when stacked=true. Default: 'stack-1'.
  stacked = true, // When true, bars are stacked. When false, bars are side-by-side. Default: true.
  tooltipDateTimeColor, // Color override for the tooltip date/time subtitle. CSS color string.
  tooltipTitle = 'Chart Data', // Title shown at the top of the hover tooltip. Default: 'Chart Data'.
  tooltipAnimationDuration = 150, // Tooltip fade-in animation duration. Unit: ms. Default: 150.
  valueFormatter = defaultValueFormatter, // Formats values for Y-axis ticks and tooltip. (value: number) => string.
}: StackedBarChartProps) => {
  const cmTheme = useTheme();
  const [chartWidth, setChartWidth] = React.useState(0);
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

  const resolvedLegendTextColor =
    legendTextColor ?? cmTheme.palette.text.secondary;
  const resolvedXAxisColor = xAxisColor ?? cmTheme.tokens.alias.Border.Neutral;
  const resolvedXAxisDateFontSize =
    xAxisDateFontSize ?? Math.max(8, xAxisFontSize - 2);
  const resolvedXAxisLabelColor =
    xAxisLabelColor ?? cmTheme.palette.text.secondary;
  const resolvedYAxisColor = yAxisColor ?? cmTheme.tokens.alias.Border.Neutral;
  const resolvedYAxisLabelColor =
    yAxisLabelColor ?? cmTheme.palette.text.secondary;
  const resolvedGridStrokeColor =
    gridStrokeColor ?? cmTheme.tokens.alias.Border.Normal;
  const resolvedBarHighlightColor = resolveThemeColor(
    cmTheme.palette.mode,
    THEME_COLORS.barHighlight,
    barHighlightColor ?? barHoverColor
  );

  const keyedSeries = React.useMemo(() => {
    const series = data?.series ?? [];
    return series.map((item, index) => {
      const colorIndex = seriesColorIndices?.[item.id] ?? index;

      return {
        ...item,
        color:
          item.color ?? FALLBACK_COLORS[colorIndex % FALLBACK_COLORS.length],
        dataKey: item.id,
      };
    });
  }, [data, seriesColorIndices]);

  const chartData = React.useMemo(() => {
    // Build a per-series value lookup keyed by the time label so that rows are
    // aligned by timestamp rather than by position. This correctly handles
    // sparse data where different series may be missing buckets at certain
    // times (the missing value defaults to 0).
    const lookupByKey = new Map(
      keyedSeries.map((s) => [
        s.dataKey,
        new Map(s.values.map((v) => [v.time, v.value])),
      ])
    );

    // Collect the ordered union of time labels across all series. Each series
    // is already sorted chronologically, so iterating them in order and
    // appending only new time labels preserves correct chronological ordering.
    const seenTimes = new Set<string>();
    const orderedPoints: Array<{
      date?: string;
      time: string;
      xAxisDate?: string;
    }> = [];

    for (const series of keyedSeries) {
      for (const point of series.values) {
        if (!seenTimes.has(point.time)) {
          seenTimes.add(point.time);
          orderedPoints.push({
            date: point.date,
            time: point.time,
            xAxisDate: point.xAxisDate,
          });
        }
      }
    }

    return orderedPoints.map(({ date, time, xAxisDate }) => {
      // Extract just the clock time if time contains "DD/MM\nHH:MM" format
      const clockTime = time.includes('\n') ? time.split('\n')[1] : time;
      const tooltipLabel = date ? `${date} ${clockTime}` : clockTime;
      const row: { [key: string]: number | string } = { time, tooltipLabel };
      if (xAxisDate) {
        row.xAxisDate = xAxisDate;
      }

      keyedSeries.forEach((series) => {
        row[series.dataKey] = lookupByKey.get(series.dataKey)?.get(time) ?? 0;
      });

      return row;
    });
  }, [keyedSeries]);

  const hasRenderableData = React.useMemo(() => {
    if (keyedSeries.length === 0) {
      return false;
    }

    if (
      keyedSeries.length === 1 &&
      keyedSeries[0]?.id === 'no-data' &&
      keyedSeries[0]?.values.length === 1 &&
      keyedSeries[0]?.values[0]?.value === 1
    ) {
      return false;
    }

    return keyedSeries.some((series) =>
      series.values.some((point) => point.value !== 0)
    );
  }, [keyedSeries]);

  const isEmptyState = forceNoDataState || !hasRenderableData;
  const showNoDataOverlay = forceNoDataState || (!isLoading && isEmptyState);
  const xAxisStrokeColor = isEmptyState
    ? TRANSPARENT_COLOR
    : resolvedXAxisColor;
  const xAxisTickColor = isEmptyState
    ? TRANSPARENT_COLOR
    : resolvedXAxisLabelColor;
  const yAxisStrokeColor = isEmptyState
    ? TRANSPARENT_COLOR
    : resolvedYAxisColor;
  const yAxisTickColor = isEmptyState
    ? TRANSPARENT_COLOR
    : resolvedYAxisLabelColor;
  const effectiveGridStrokeColor = isEmptyState
    ? TRANSPARENT_COLOR
    : resolvedGridStrokeColor;

  const displayChartData = React.useMemo(() => {
    if (chartData.length > 0) {
      return chartData;
    }

    return [{ time: '', tooltipLabel: '' }];
  }, [chartData]);

  const effectiveXAxisInterval = React.useMemo(() => {
    const pointCount = displayChartData.length;
    const baseInterval = Math.max(1, xAxisInterval);

    if (pointCount <= 1 || chartWidth <= 0) {
      return baseInterval;
    }

    const maxTickLabels = Math.max(
      1,
      Math.floor(chartWidth / MIN_X_AXIS_LABEL_SPACING_PX)
    );
    const widthBasedInterval = Math.max(
      1,
      Math.ceil(pointCount / maxTickLabels)
    );

    return Math.max(baseInterval, widthBasedInterval);
  }, [displayChartData.length, chartWidth, xAxisInterval]);

  const hasXAxisDates = React.useMemo(
    () =>
      displayChartData.some(
        (row) => typeof row.xAxisDate === 'string' && row.xAxisDate !== ''
      ),
    [displayChartData]
  );

  const xAxisHeight = hasXAxisDates
    ? xAxisFontSize + resolvedXAxisDateFontSize + 18
    : undefined;

  const XAxisTick = React.useCallback(
    (props: {
      index?: number;
      payload?: { value: string };
      x?: number | string;
      y?: number | string;
    }) => {
      const { payload, index } = props;
      const x = Number(props.x ?? 0);
      const y = Number(props.y ?? 0);
      const showLabel =
        index !== undefined && index % effectiveXAxisInterval === 0;
      // The time field may contain "DD/MM\nHH:MM" for multi-day ranges - extract just the clock time
      const rawTime = payload?.value ?? '';
      const timeLabel = showLabel
        ? rawTime.includes('\n')
          ? rawTime.split('\n')[1]
          : rawTime
        : '';
      const row = index !== undefined ? displayChartData[index] : undefined;
      const xAxisDateLabel =
        showLabel && row && typeof row.xAxisDate === 'string'
          ? row.xAxisDate
          : '';

      return (
        <g transform={`translate(${x},${y})`}>
          {showLabel && (
            <text
              dy={xAxisFontSize}
              fill={xAxisTickColor}
              fontSize={xAxisFontSize}
              textAnchor="middle"
            >
              {timeLabel}
            </text>
          )}
          {xAxisDateLabel && (
            <text
              dy={xAxisFontSize + 4 + resolvedXAxisDateFontSize}
              fill={xAxisTickColor}
              fontSize={resolvedXAxisDateFontSize}
              textAnchor="middle"
            >
              {xAxisDateLabel}
            </text>
          )}
        </g>
      );
    },
    [
      displayChartData,
      effectiveXAxisInterval,
      resolvedXAxisDateFontSize,
      xAxisFontSize,
      xAxisTickColor,
    ]
  );

  const handleContainerResize = React.useCallback((width: number) => {
    const normalizedWidth = Math.max(0, Math.floor(width));
    setChartWidth((previousWidth) =>
      previousWidth === normalizedWidth ? previousWidth : normalizedWidth
    );
  }, []);

  const legendColumns = React.useMemo(() => {
    if (chartWidth <= 0) {
      return MAX_LEGEND_COLUMNS;
    }

    if (chartWidth < LEGEND_THREE_COLUMN_BREAKPOINT_PX) {
      return MIN_LEGEND_COLUMNS;
    }

    if (chartWidth < LEGEND_FOUR_COLUMN_BREAKPOINT_PX) {
      return 4;
    }

    return MAX_LEGEND_COLUMNS;
  }, [chartWidth]);

  const legendLabelMaxWidthPx =
    legendColumns >= 4
      ? LEGEND_LABEL_MAX_WIDTH_FIVE_COLUMNS_PX
      : LEGEND_LABEL_MAX_WIDTH_PX;

  const legendItemMaxWidthPx =
    legendIconSize + 6 + legendLabelMaxWidthPx + legendItemSpacing;
  const legendGridMaxWidthPx =
    legendColumns * legendItemMaxWidthPx - legendItemSpacing;
  const legendSingleRowMinHeightPx =
    Math.max(legendIconSize, Math.ceil(legendFontSize * legendLineHeight)) + 4;
  const resolvedLegendRows = Math.max(1, legendRows);
  const legendReservedHeightPx =
    resolvedLegendRows * legendSingleRowMinHeightPx +
    (resolvedLegendRows - 1) * legendRowGap;
  const legendItems = isEmptyState ? [] : keyedSeries;

  const noDataOverlay = (
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
        pointerEvents: 'none',
        position: 'absolute',
        transition: `opacity ${LOADING_TRANSITION_DURATION_MS}ms ease`,
        zIndex: 1,
      }}
    >
      <Paper
        sx={(theme) => ({
          marginLeft: 0,
          marginBottom: -1,
          backgroundColor: theme.tokens.alias.Background.Neutralsubtle,
          borderRadius: 1.5,
          borderWidth: 0,
          px: 1.5,
          py: 0.75,
        })}
        variant="outlined"
      >
        <Typography
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            font: cmTheme.font.semibold,
            fontSize: 12,
          })}
        >
          No Data
        </Typography>
      </Paper>
    </Box>
  );

  const legend = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 8,
        paddingBottom: 4,
        position: 'relative',
        zIndex: 0,
        width: '100%',
      }}
    >
      <div
        style={{
          columnGap: legendItemSpacing,
          zIndex: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${legendColumns}, minmax(0, 1fr))`,
          height: `${legendReservedHeightPx}px`,
          lineHeight: legendLineHeight,
          maxWidth: `${legendGridMaxWidthPx}px`,
          minHeight: `${legendReservedHeightPx}px`,
          rowGap: legendRowGap,
          width: '100%',
        }}
      >
        {legendItems.map((item) => (
          <div
            key={`legend-${item.dataKey}`}
            style={{
              alignItems: 'center',
              color: resolvedLegendTextColor,
              display: 'inline-flex',
              fontSize: legendFontSize,
              gap: 6,
              justifySelf: 'center',
              maxWidth: `${legendItemMaxWidthPx}px`,
              minWidth: 0,
              paddingTop: 2,
              paddingBottom: 2,
              width: '100%',
            }}
          >
            <span
              style={{
                background: item.color,
                borderRadius: 2,
                display: 'inline-block',
                height: legendIconSize,
                width: legendIconSize,
              }}
            />
            <span
              style={{
                maxWidth: `${legendLabelMaxWidthPx}px`,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={item.label}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const loadingOverlay = (
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
      <LoadingSpinner size="extra-large" />
    </Box>
  );

  if (keyedSeries.length === 0) {
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <div
          style={{
            opacity: showSpinner ? 0 : 1,
            transition: `opacity ${LOADING_TRANSITION_DURATION_MS}ms ease`,
          }}
        >
          <div style={{ height, position: 'relative', width: '100%' }}>
            <ResponsiveContainer
              height="100%"
              onResize={handleContainerResize}
              width="100%"
            >
              <BarChart
                barCategoryGap="45%"
                barSize={barWidth}
                data={displayChartData}
                margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
              >
                <CartesianGrid
                  stroke={effectiveGridStrokeColor}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  height={xAxisHeight}
                  interval={0}
                  minTickGap={16}
                  stroke={xAxisStrokeColor}
                  tick={XAxisTick}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, EMPTY_STATE_AXIS_MAX_VALUE]}
                  stroke={yAxisStrokeColor}
                  tick={{
                    fill: yAxisTickColor,
                    fontSize: yAxisFontSize,
                  }}
                  tickFormatter={(value) => valueFormatter(value as number)}
                  width={45}
                />
              </BarChart>
            </ResponsiveContainer>

            {noDataOverlay}
          </div>

          {legend}
        </div>

        {loadingOverlay}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          opacity: showSpinner ? 0 : 1,
          transition: `opacity ${LOADING_TRANSITION_DURATION_MS}ms ease`,
        }}
      >
        <div style={{ height, position: 'relative', width: '100%' }}>
          <ResponsiveContainer
            height="100%"
            onResize={handleContainerResize}
            width="100%"
          >
            <BarChart
              barCategoryGap="45%"
              barSize={barWidth}
              data={displayChartData}
              margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
            >
              <CartesianGrid
                stroke={effectiveGridStrokeColor}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                height={xAxisHeight}
                interval={0}
                stroke={xAxisStrokeColor}
                tick={XAxisTick}
              />
              <YAxis
                allowDecimals={false}
                domain={
                  isEmptyState ? [0, EMPTY_STATE_AXIS_MAX_VALUE] : undefined
                }
                stroke={yAxisStrokeColor}
                tick={{ fill: yAxisTickColor, fontSize: yAxisFontSize }}
                tickFormatter={(value) => valueFormatter(value as number)}
                width={45}
              />
              <Tooltip
                animationDuration={tooltipAnimationDuration}
                content={(props) => (
                  <StackedBarChartTooltip
                    active={props.active}
                    label={props.label}
                    payload={props.payload}
                    tooltipDateTimeColor={tooltipDateTimeColor}
                    tooltipTitle={tooltipTitle}
                    valueFormatter={valueFormatter}
                  />
                )}
                cursor={{ fill: resolvedBarHighlightColor }}
                wrapperStyle={{ zIndex: 1000 }}
              />
              {keyedSeries.map((item) => (
                <Bar
                  activeBar={false}
                  animationDuration={barAnimationDuration}
                  dataKey={item.dataKey}
                  fill={item.color}
                  hide={isEmptyState}
                  key={item.dataKey}
                  name={item.label}
                  stackId={stacked ? (stackId ?? 'stack-1') : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>

          {noDataOverlay}
        </div>

        {legend}
      </div>

      {loadingOverlay}
    </div>
  );
};

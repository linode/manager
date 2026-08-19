import { Box, Paper, Typography } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import React from 'react';
import {
  AreaChart as _AreaChart,
  Area,
  CartesianGrid,
  Legend,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AccessibleAreaChart } from 'src/components/AreaChart/AccessibleAreaChart';
import MetricsDisplay from 'src/components/LineGraph/MetricsDisplay';
import { StyledBottomLegend } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSummary/TablesPanel';

import {
  generate12HourTicks,
  humanizeLargeData,
  tooltipLabelFormatter,
  tooltipValueFormatter,
} from './utils';

import type { SxProps } from '@mui/material/styles';
import type { MouseHandlerDataParam, TooltipContentProps } from 'recharts';
import type { MetricsDisplayRow } from 'src/components/LineGraph/MetricsDisplay';

export interface DataSet {
  [label: string]: number;
  timestamp: number;
}

export type ChartVariant = 'area' | 'line';

export type TooltipMetricEntry = [string, number];

export type TooltipEntriesByTimestamp = Map<number, TooltipMetricEntry[]>;

export interface CustomTooltipOptions {
  /**
   * Optional prop to show the tooltip or not
   */
  active?: boolean;
  /**
   * Optional active dot interaction handlers.
   */
  activeDotHandlers?: ActiveDotHandlers;

  /**
   * The color mapping for each area in the chart.
   */
  areasColorMap?: Record<string, string>;

  /**
   * The hidden legend rows , not to be show in the tooltip. This allows the tooltip to reflect the same legend state as the on-screen graph.
   */
  hiddenLegendRows?: string[];

  /** Controls whether tooltip content should be rendered as active. */
  isTooltipVisible?: boolean;

  /**
   * Called after filteredTooltip state changes (e.g. after active dot click). Use this to trigger tooltip position recalculation with updated tooltip dimensions.
   */
  onFilteredTooltipChange?: () => void;

  /**
   * Optional precomputed tooltip metric entries keyed by timestamp.
   */
  tooltipEntriesByTimestamp?: TooltipEntriesByTimestamp;

  /**
   * Optional externally controlled tooltip filter.
   */
  tooltipFilter?: { dataKey: string };

  /**
   * Optional CSS properties to apply to the tooltip content container.
   */
  tooltipWrapperStyle?: SxProps;
}

export interface AreaProps {
  /**
   * color for the area
   */
  color: string;

  /**
   * datakey for the area
   */
  dataKey: string;

  /**
   * optional stack id; areas with the same id are stacked together
   */
  stackId?: string;
}

interface ChartCallbacks {
  /**
   * Callback fired on mouse up event on the chart
   */
  onClick?: (e: MouseHandlerDataParam) => void;
  /**
   * Callback fired on mouse down event on the chart
   */
  onMouseDown?: (e: MouseHandlerDataParam) => void;
  /**
   * Callback fired on mouse leave event on the chart.
   */
  onMouseLeave?: () => void;

  /**
   * Callback fired on mouse move event on the chart
   */
  onMouseMove?: (e: MouseHandlerDataParam) => void;

  /**
   * Callback fired on mouse up event on the chart
   */
  onMouseUp?: (e: MouseHandlerDataParam) => void;
}

interface ReferenceAreaProps {
  /**
   * Ending x-axis value of the reference area
   */
  referenceEnd: number;
  /**
   * Starting x-axis value of the reference area
   */
  referenceStart: number;
}

interface XAxisProps {
  /**
   * format for the x-axis timestamp
   * ex: 'hh' to convert timestamp into hour
   */
  tickFormat: string;

  /**
   * represents the pixel gap between two x-axis ticks
   */
  tickGap: number;
}

interface ActiveDotHandlers {
  /**
   * Callback fired when an active dot is clicked. The dataKey of the corresponding area is passed as an argument.
   */
  onClick?: (dataKey: string) => void;
  /**
   * Callback fired when the mouse enters an active dot. The dataKey of the corresponding area is passed as an argument.
   */
  onMouseEnter?: (dataKey: string) => void;
  /**
   * Callback fired when the mouse leaves an active dot.
   */
  onMouseLeave?: () => void;
}

interface YAxisProps {
  /**
   * The formatter function for the y-axis tick.
   */
  tickFormat: (value: number) => string;
}

export interface AreaChartProps {
  /**
   * list of areas to be displayed
   */
  areas: AreaProps[];

  /**
   * aria-label for the graph
   */
  ariaLabel: string;

  /**
   * chart callbacks (onMouseDown, onMouseMove, onMouseUp, onMouseLeave)
   */
  chartCallbacks?: ChartCallbacks;

  /**
   * Optional ref to the chart container element. Used for viewport boundary calculations during tooltip positioning.
   */
  chartContainerRef?: React.RefObject<HTMLDivElement | null>;

  /**
   * connect nulls value between two data points
   */
  connectNulls?: boolean;

  /**
   * curve type for the area chart
   * @default monotone
   */
  curveType?: 'linear' | 'monotone' | 'natural';

  /**
   * If passed, the chart will use this tooltip component instead of the default one. This allows for custom tooltip rendering according to consumers.
   */
  CustomConsumerTooltip?: React.ComponentType<CustomTooltipProps>;

  /**
   * Optional grouped options used only by custom tooltip renderers.
   */
  customTooltipOptions?: CustomTooltipOptions;

  /**
   * data to be displayed on the graph
   */
  data: any;

  /**
   * radius of the dots to be displayed
   */
  dotRadius?: number;

  /**
   *
   */
  fillOpacity?: number;

  /**
   * The height of chart container.
   */
  height?: number;

  /**
   * Sets the height of the legend. Overflow scroll if the content exceeds the height.
   */
  legendHeight?: string;

  /**
   * list of legends rows to be displayed
   */
  legendRows?: Omit<MetricsDisplayRow[], 'handleLegendClick'>;

  /**
   * The sizes of whitespace around the container.
   */
  margin?: { bottom: number; left: number; right: number; top: number };

  /**
   * On Click of legend row, returns the list of hidden series. This is used for accessibility purposes to announce which series are hidden when a legend row is clicked.
   */
  onHiddenAreasChange?: (hiddenKeys: string[]) => void;

  /**
   * reference area to be highlighted on the chart
   */
  referenceArea?: null | ReferenceAreaProps;

  /**
   * control the visibility of dots for each data points
   */
  showDot?: boolean;

  /**
   * true to display legends rows else false to hide
   * @default false
   */
  showLegend?: boolean;

  /**
   * timezone for the timestamp of graph data
   */
  timezone: string;

  /**
   * formatter for the tooltip value
   */
  tooltipCustomValueFormatter?: (value: number, unit: string) => string;

  /**
   * Optional tooltip position. When provided, overrides default recharts positioning.
   */
  tooltipPosition?: undefined | { x: number; y: number };

  /**
   * Optional ref to the tooltip wrapper element. Used for measuring tooltip dimensions during positioning.
   */
  tooltipRef?: React.RefObject<HTMLDivElement | null>;

  /**
   * unit to be displayed with data
   */
  unit: string;

  /**
   * make chart appear as a line or area chart
   * @default area
   */
  variant?: ChartVariant;

  /**
   * The width of chart container.
   */
  width?: number;

  /**
   * x-axis properties
   */
  xAxis: XAxisProps;

  /**
   * number of x-axis ticks should be shown
   * 0 or undefined : ticks will be generated by recharts
   * non-zero value : this many ticks will be generated based on the starting & ending timestamp in the data
   */
  xAxisTickCount?: number;

  /**
   * y-axis properties
   */
  yAxisProps?: YAxisProps;
}

interface CustomTooltipProps extends TooltipContentProps {
  /**
   * Optional grouped options used by custom tooltip renderers.
   */
  customTooltipOptions?: CustomTooltipOptions;

  /**
   * timezone for formatting the tooltip label timestamp
   */
  timezone: string;

  /**
   * formatter for the tooltip value
   */
  tooltipCustomValueFormatter?: (value: number, unit: string) => string;

  /**
   * Optional ref to the tooltip wrapper element. Used for measuring tooltip dimensions during positioning.
   */
  tooltipRef?: React.RefObject<HTMLDivElement | null>;

  /**
   * unit to be displayed with data in tooltip
   */
  unit: string;
}

export const AreaChart = (props: AreaChartProps) => {
  const {
    areas,
    ariaLabel,
    connectNulls,
    curveType = 'monotone',
    data,
    dotRadius = 3,
    fillOpacity,
    height = '100%',
    legendHeight,
    legendRows,
    margin = { bottom: 0, left: -20, right: 30, top: 0 },
    showDot,
    showLegend,
    timezone,
    unit,
    variant,
    width = '100%',
    xAxis,
    xAxisTickCount,
    yAxisProps,
    tooltipCustomValueFormatter,
    chartCallbacks,
    referenceArea,
    tooltipRef,
    chartContainerRef,
    tooltipPosition,
    onHiddenAreasChange,
    CustomConsumerTooltip,
    customTooltipOptions,
  } = props;

  const {
    tooltipFilter,
    onFilteredTooltipChange,
    isTooltipVisible,
    activeDotHandlers,
  } = customTooltipOptions ?? {};
  const {
    onClick: onActiveDotClick,
    onMouseEnter: onActiveDotMouseEnter,
    onMouseLeave: onActiveDotMouseLeave,
  } = activeDotHandlers ?? {};

  const theme = useTheme();
  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onClick } =
    chartCallbacks ?? {};
  const { referenceStart, referenceEnd } = referenceArea ?? {};

  const [activeSeries, setActiveSeries] = React.useState<Array<string>>([]);
  const handleLegendClick = (dataKey: string) => {
    if (activeSeries.includes(dataKey)) {
      setActiveSeries(activeSeries.filter((el) => el !== dataKey));
    } else {
      setActiveSeries((prev) => [...prev, dataKey]);
    }
  };

  const xAxisTickFormatter = (timestamp: number) => {
    return DateTime.fromMillis(timestamp, { zone: timezone }).toFormat(
      xAxis.tickFormat
    );
  };

  const TooltipWrapper = React.useCallback(
    (tooltipProps: TooltipContentProps) => {
      const controlledTooltipActive =
        isTooltipVisible === undefined
          ? undefined
          : Boolean(tooltipProps.active && isTooltipVisible);
      return CustomConsumerTooltip ? (
        React.createElement(CustomConsumerTooltip, {
          ...tooltipProps,
          customTooltipOptions: {
            ...customTooltipOptions,
            active: controlledTooltipActive,
            hiddenLegendRows: activeSeries,
          },
          timezone,
          tooltipCustomValueFormatter,
          tooltipRef,
          unit,
        })
      ) : (
        <CustomTooltip
          {...tooltipProps}
          timezone={timezone}
          tooltipCustomValueFormatter={tooltipCustomValueFormatter}
          tooltipRef={tooltipRef}
          unit={unit}
        />
      );
    },
    [
      CustomConsumerTooltip,
      activeSeries,
      customTooltipOptions,
      isTooltipVisible,
      timezone,
      tooltipCustomValueFormatter,
      tooltipRef,
      unit,
    ]
  );

  const CustomLegend = ({ legendHeight }: { legendHeight?: string }) => {
    if (legendRows) {
      const legendRowsWithClickHandler = legendRows.map((legendRow) => ({
        ...legendRow,
        handleLegendClick: () => handleLegendClick(legendRow.legendTitle),
      }));

      return (
        <StyledBottomLegend legendHeight={legendHeight}>
          <MetricsDisplay
            hiddenRows={activeSeries}
            rows={legendRowsWithClickHandler}
          />
        </StyledBottomLegend>
      );
    }
    return null;
  };

  const accessibleDataKeys = areas.map((area) => area.dataKey);
  const hideAxis = !data || data.length === 0; // in recharts 3.8.1, if there is no data, the axes are still rendered with default ticks which can be misleading, so we hide them when there is no data to display

  const legendStyles = {
    bottom: 0,
    left: 0,
    width: '100%',
  };

  const handleMouseMove = (e: MouseHandlerDataParam) => {
    // Call external callback if provided in chartCallbacks
    if (onMouseMove) {
      onMouseMove(e);
    }
  };

  const handleMouseLeave = () => {
    onMouseLeave?.();
  };

  React.useLayoutEffect(() => {
    onFilteredTooltipChange?.();
  }, [onFilteredTooltipChange, tooltipFilter]);

  React.useEffect(() => {
    onHiddenAreasChange?.(activeSeries);
  }, [activeSeries, onHiddenAreasChange]);

  return (
    <>
      <ResponsiveContainer
        data-testid="area-chart-container"
        height={height}
        initialDimension={{ width: 1, height: 1 }}
        ref={chartContainerRef}
        width={width}
      >
        <_AreaChart
          aria-label={ariaLabel}
          data={data}
          margin={margin}
          onClick={onClick}
          onMouseDown={onMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onMouseUp={onMouseUp}
        >
          <CartesianGrid
            stroke={theme.color.grey7}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="timestamp"
            domain={['dataMin', 'dataMax']}
            hide={hideAxis}
            interval={xAxisTickCount ? 0 : 'preserveEnd'}
            minTickGap={xAxis.tickGap}
            scale="time"
            stroke={theme.color.label}
            tickFormatter={xAxisTickFormatter}
            ticks={
              xAxisTickCount
                ? generate12HourTicks(data, timezone, xAxisTickCount)
                : undefined // instead of empty we can pass undefined to take care of the case when xAxisTickCount is 0 or undefined, both means we want recharts to generate ticks on its own
            }
            type="number"
          />
          <YAxis
            hide={hideAxis} // hide y-axis
            stroke={theme.color.label}
            style={{
              /**
               * When all series are hidden, we hide y-axis instead of not rendering, because when y-axis is not rendered, the chart area takes up the full width and x-axis is hampered, so maintaining consistency
               */
              display: activeSeries.length === areas.length ? 'none' : 'inline',
            }}
            tickFormatter={
              yAxisProps?.tickFormat ? yAxisProps.tickFormat : humanizeLargeData
            }
          />
          <Tooltip
            content={TooltipWrapper}
            contentStyle={{
              color: theme.tokens.color.Neutrals[70],
            }}
            itemStyle={{
              color: theme.tokens.color.Neutrals[70],
              font: theme.font.bold,
            }}
            offset={20}
            position={tooltipPosition}
            wrapperStyle={{ zIndex: 1000 }} // we need higher z-index for tooltip to be above the reference area in 3.8.1
          />
          {showLegend && !legendRows && (
            <Legend
              formatter={(value) => (
                <span style={{ color: theme.color.label, cursor: 'pointer' }}>
                  {value}
                </span>
              )}
              iconType="square"
              onClick={({ dataKey }) => {
                if (dataKey) {
                  handleLegendClick(dataKey as string);
                }
              }}
              wrapperStyle={legendStyles}
            />
          )}
          {showLegend && legendRows && (
            <Legend
              content={<CustomLegend legendHeight={legendHeight} />}
              wrapperStyle={legendStyles}
            />
          )}
          {referenceStart !== undefined && referenceEnd !== undefined && (
            <ReferenceArea
              strokeOpacity={0.3}
              x1={referenceStart}
              x2={referenceEnd}
            />
          )}
          {areas.map(({ color, dataKey, stackId }) => (
            <Area
              activeDot={
                customTooltipOptions && isTooltipVisible
                  ? {
                      onClick: () => onActiveDotClick?.(dataKey),
                      onMouseEnter: () => onActiveDotMouseEnter?.(dataKey),
                      onMouseLeave: () => onActiveDotMouseLeave?.(),
                    }
                  : false
              }
              connectNulls={connectNulls}
              dataKey={dataKey}
              dot={{ r: showDot ? dotRadius : 0 }}
              fill={color}
              fillOpacity={variant === 'line' ? 0 : (fillOpacity ?? 1)}
              hide={activeSeries.includes(dataKey)}
              isAnimationActive={false}
              key={dataKey}
              stackId={stackId}
              stroke={color}
              type={curveType}
              zIndex={1000} // the x-axis and y-axis have z-index of 500, so we need higher z-index for the area to be above the axes in 3.8.1
            />
          ))}
        </_AreaChart>
      </ResponsiveContainer>
      <AccessibleAreaChart
        ariaLabel={ariaLabel}
        data={data}
        dataKeys={accessibleDataKeys}
        timezone={timezone}
        unit={unit}
      />
    </>
  );
};

const StyledTooltipPaper = styled(Paper, {
  label: 'StyledTooltipPaper',
})(({ theme }) => ({
  border: `1px solid ${theme.color.border2}`,
  padding: theme.spacing(1),
}));

const CustomTooltip = React.memo(
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

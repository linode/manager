import { useTheme } from '@mui/material/styles';
import React from 'react';
import {
  BarChart as _BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Rectangle,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { generate12HourTicks, humanizeLargeData } from '../AreaChart/utils';
import { useTooltipWrapper } from '../chartHooks';
import {
  computeXAxisDomain,
  formatXAxisTick,
  getHideAxis,
} from '../chartUtils';
import { CustomChartTooltip } from '../CustomChartTooltip';
import { BarChartLegend } from './BarChartLegend';
import { useBarChartInteractions } from './useBarChartInteractions';

import type { BaseChartProps } from '../chartTypes';
import type { MouseHandlerDataParam } from 'recharts';

interface TooltipCursorProps {
  /**
   * The fill color of the tooltip cursor rectangle.
   */
  fill: string;
  /**
   * The height of the tooltip cursor rectangle.
   */
  height?: number;
  /**
   * The width of the tooltip cursor rectangle.
   */
  width?: number;
  /**
   * The x-coordinate of the tooltip cursor rectangle.
   */
  x?: number;
  /**
   * The y-coordinate of the tooltip cursor rectangle.
   */
  y?: number;
}

// Narrows the default tooltip cursor rectangle (which spans the full category band, including bar gaps) down to the bar's own width
const TooltipCursor = React.memo((props: TooltipCursorProps) => {
  const { fill, height = 0, width = 0, x = 0, y = 0 } = props;
  const cursorWidth = Math.min(width, 100);
  return (
    <Rectangle
      fill={fill}
      fillOpacity={0.5}
      height={height}
      width={cursorWidth}
      x={x + (width - cursorWidth) / 2}
      y={y}
    />
  );
});

/**
 * Renders a bar chart with a timestamp-based (time scale) x-axis. Not meant to be consumed directly —
 * use `BarChartWrapper` instead, which dispatches to this or the categorical bar chart.
 */
export const BarChart = (props: BaseChartProps) => {
  const {
    areas: bars,
    ariaLabel,
    data,
    height = '100%',
    legendHeight,
    legendRows,
    margin = { bottom: 0, left: -20, right: 30, top: 0 },
    showLegend,
    timezone,
    unit,
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
    onHiddenDataPlotsChange: onHiddenBarsChange,
    CustomConsumerTooltip,
    customTooltipOptions,
    variant = 'normal',
  } = props;

  const {
    activeSeries,
    handleLegendClick,
    isTooltipVisible,
    onActiveDotClick,
    onActiveDotMouseEnter,
    onActiveDotMouseLeave,
  } = useBarChartInteractions({ customTooltipOptions, onHiddenBarsChange });

  const theme = useTheme();
  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onClick } =
    chartCallbacks ?? {};
  const { referenceStart, referenceEnd } = referenceArea ?? {};
  const xAxisDomain: ['dataMin', 'dataMax'] | [number, number] =
    React.useMemo(() => {
      return computeXAxisDomain(data);
    }, [data]);

  const TooltipWrapper = useTooltipWrapper({
    CustomConsumerTooltip,
    DefaultTooltip: CustomChartTooltip,
    activeSeries,
    customTooltipOptions,
    isTooltipVisible,
    timezone,
    tooltipCustomValueFormatter,
    tooltipRef,
    unit,
  });

  const hideAxis = getHideAxis(data);

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

  return (
    <ResponsiveContainer
      data-testid="bar-chart-container"
      height={height}
      initialDimension={{ width: 1, height: 1 }}
      ref={chartContainerRef}
      width={width}
    >
      <_BarChart
        aria-label={ariaLabel}
        barCategoryGap="35%"
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
          domain={xAxisDomain}
          hide={hideAxis}
          interval={xAxisTickCount ? 0 : 'preserveEnd'}
          minTickGap={xAxis.tickGap}
          scale="time"
          stroke={theme.color.label}
          tickFormatter={(timestamp) =>
            formatXAxisTick(timestamp, timezone, xAxis.tickFormat)
          }
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
            display: activeSeries.length === bars.length ? 'none' : 'inline',
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
          cursor={
            isTooltipVisible ? (
              <TooltipCursor fill={theme.color.grey1} />
            ) : (
              false
            )
          } // disable the cursor when tooltip is not visible, because when tooltip is not visible, we don't want the cursor to be shown on hover
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
            content={
              <BarChartLegend
                activeSeries={activeSeries}
                handleLegendClick={handleLegendClick}
                legendHeight={legendHeight}
                legendRows={legendRows}
              />
            }
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
        {bars.map(({ color, dataKey, stackId }) => (
          <Bar
            activeBar={
              customTooltipOptions && isTooltipVisible
                ? {
                    onClick: () => onActiveDotClick?.(dataKey),
                    onMouseEnter: () => onActiveDotMouseEnter?.(dataKey),
                    onMouseMove: () => onActiveDotMouseEnter?.(dataKey),
                    onMouseLeave: () => onActiveDotMouseLeave?.(),
                  }
                : false
            }
            dataKey={dataKey}
            fill={color}
            hide={activeSeries.includes(dataKey)}
            isAnimationActive={false}
            key={dataKey}
            maxBarSize={75}
            stackId={variant === 'stacked-bar' ? 'same-stack' : stackId} // if variant is stacked, we want all bars to be stacked together, so we give them the same stackId, otherwise we use the provided stackId
            stroke={color}
            zIndex={1000} // the x-axis and y-axis have z-index of 500, so we need higher z-index for the area to be above the axes in 3.8.1
          />
        ))}
      </_BarChart>
    </ResponsiveContainer>
  );
};

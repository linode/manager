import { useTheme } from '@mui/material/styles';
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

import { useTooltipWrapper } from '../chartHooks';
import { formatXAxisTick, getHideAxis } from '../chartUtils';
import { CustomChartTooltip } from '../CustomChartTooltip';
import { generate12HourTicks, humanizeLargeData } from './utils';

import type { BaseChartProps } from '../chartTypes';
import type { MouseHandlerDataParam } from 'recharts';

export interface DataSet {
  [label: string]: number;
  timestamp: number;
}

export const AreaChart = (props: BaseChartProps) => {
  const {
    areas: areas,
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
    onHiddenDataPlotsChange: onHiddenAreasChange,
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

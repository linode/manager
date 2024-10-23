import { Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import React from 'react';
import {
  AreaChart as _AreaChart,
  Area,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AccessibleAreaChart } from 'src/components/AreaChart/AccessibleAreaChart';
import { Box } from 'src/components/Box';
import MetricsDisplay from 'src/components/LineGraph/MetricsDisplay';
import { Paper } from 'src/components/Paper';
import { StyledBottomLegend } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSummary/TablesPanel';

import {
  humanizeLargeData,
  tooltipLabelFormatter,
  tooltipValueFormatter,
} from './utils';

import type { TooltipProps } from 'recharts';
import type { MetricsDisplayRow } from 'src/components/LineGraph/MetricsDisplay';

interface AreaProps {
  /**
   * color for the area
   */
  color: string;

  /**
   * datakey for the area
   */
  dataKey: string;
}

interface XAxisProps {
  /**
   * format for the x-axis timestamp
   * ex: 'hh' to convert timestamp into hour
   */
  tickFormat: string;

  /**
   * represents the pixer gap between two x-axis ticks
   */
  tickGap: number;
}

interface AreaChartProps {
  /**
   * list of areas to be displayed
   */
  areas: AreaProps[];

  /**
   * arialabel for the graph
   */
  ariaLabel: string;

  /**
   * data to be displayed on the graph
   */
  data: any;

  /**
   *
   */
  fillOpacity?: number;

  /**
   * maximum height of the chart container
   */
  height: number;

  /**
   * list of legends rows to be displayed
   */
  legendRows?: Omit<MetricsDisplayRow[], 'handleLegendClick'>;

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
   * unit to be displayed with data
   */
  unit: string;

  /**
   * make chart appear as a line or area chart
   * @default area
   */
  variant?: 'area' | 'line';

  /**
   * x-axis properties
   */
  xAxis: XAxisProps;
}

export const AreaChart = (props: AreaChartProps) => {
  const {
    areas,
    ariaLabel,
    data,
    fillOpacity,
    height,
    legendRows,
    showLegend,
    timezone,
    unit,
    variant,
    xAxis,
  } = props;

  const theme = useTheme();

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

  const CustomTooltip = ({
    active,
    label,
    payload,
  }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      return (
        <StyledTooltipPaper>
          <Typography>{tooltipLabelFormatter(label, timezone)}</Typography>
          {payload.map((item) => (
            <Box
              display="flex"
              justifyContent="space-between"
              key={item.dataKey}
            >
              <Typography fontFamily={theme.font.bold}>
                {item.dataKey}
              </Typography>
              <Typography fontFamily={theme.font.bold} marginLeft={2}>
                {tooltipValueFormatter(item.value, unit)}
              </Typography>
            </Box>
          ))}
        </StyledTooltipPaper>
      );
    }

    return null;
  };

  const CustomLegend = () => {
    if (legendRows) {
      const legendRowsWithClickHandler = legendRows.map((legendRow) => ({
        ...legendRow,
        handleLegendClick: () => handleLegendClick(legendRow.legendTitle),
      }));

      return (
        <StyledBottomLegend>
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

  return (
    <>
      <ResponsiveContainer height={height} width="100%">
        <_AreaChart aria-label={ariaLabel} data={data}>
          <CartesianGrid
            stroke={theme.color.grey7}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="timestamp"
            domain={['dataMin', 'dataMax']}
            interval="preserveEnd"
            minTickGap={xAxis.tickGap}
            scale="time"
            stroke={theme.color.label}
            tickFormatter={xAxisTickFormatter}
            type="number"
          />
          <YAxis stroke={theme.color.label} tickFormatter={humanizeLargeData} />
          <Tooltip
            contentStyle={{
              color: '#606469',
            }}
            itemStyle={{
              color: '#606469',
              fontFamily: theme.font.bold,
            }}
            content={<CustomTooltip />}
          />
          {showLegend && !legendRows && (
            <Legend
              formatter={(value) => (
                <span style={{ color: theme.color.label, cursor: 'pointer' }}>
                  {value}
                </span>
              )}
              onClick={({ dataKey }) => {
                if (dataKey) {
                  handleLegendClick(dataKey as string);
                }
              }}
              wrapperStyle={{
                left: 25,
              }}
              iconType="square"
            />
          )}
          {showLegend && legendRows && (
            <Legend
              wrapperStyle={{
                left: 20,
              }}
              content={<CustomLegend />}
            />
          )}
          {areas.map(({ color, dataKey }) => (
            <Area
              dataKey={dataKey}
              fill={color}
              fillOpacity={variant === 'line' ? 0 : fillOpacity ?? 1}
              hide={activeSeries.includes(dataKey)}
              isAnimationActive={false}
              key={dataKey}
              stroke={color}
              type="monotone"
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

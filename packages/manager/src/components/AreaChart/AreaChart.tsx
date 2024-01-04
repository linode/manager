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
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';

import { AccessibleAreaChart } from 'src/components/AreaChart/AccessibleAreaChart';
import { Paper } from 'src/components/Paper';

import { tooltipLabelFormatter, tooltipValueFormatter } from './utils';
import MetricsDisplay from 'src/components/LineGraph/MetricsDisplay';
import { StyledBottomLegend } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSummary/TablesPanel';
import { MetricsDisplayRow } from 'src/components/LineGraph/MetricsDisplay';

interface AreaProps {
  color: string;
  dataKey: string;
}

interface XAxisProps {
  tickFormat: string;
  tickGap: number;
}

interface AreaChartProps {
  areas: AreaProps[];
  ariaLabel: string;
  data: any;
  height: number;
  showLegend?: boolean;
  timezone: string;
  unit: string;
  xAxis: XAxisProps;
  legendRows?: Omit<MetricsDisplayRow[], 'handleLegendClick'>;
}

const humanizeLargeData = (value: number) => {
  if (value >= 1000000) {
    return value / 1000000 + 'M';
  }
  if (value >= 1000) {
    return value / 1000 + 'K';
  }
  return `${value}`;
};

export const AreaChart = (props: AreaChartProps) => {
  const {
    areas,
    ariaLabel,
    data,
    height,
    showLegend,
    timezone,
    unit,
    xAxis,
    legendRows,
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
            <Typography fontFamily={theme.font.bold} key={item.dataKey}>
              {item.dataKey}: {tooltipValueFormatter(item.value, unit)}
            </Typography>
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
          <MetricsDisplay rows={legendRowsWithClickHandler} />
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
              wrapperStyle={{
                left: 25,
              }}
              iconType="square"
              onClick={(props) => handleLegendClick(props.dataKey)}
            />
          )}
          {showLegend && legendRows && (
            <Legend
              content={<CustomLegend />}
              wrapperStyle={{
                left: 20,
              }}
            />
          )}
          {areas.map(({ color, dataKey }) => (
            <Area
              dataKey={dataKey}
              fill={color}
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

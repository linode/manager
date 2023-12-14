import { Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import React from 'react';
import {
  AreaChart as _AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';

import { Paper } from 'src/components/Paper';
import { roundTo } from 'src/utilities/roundTo';

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
  data: any;
  height: number;
  timezone: string;
  unit: string;
  xAxis: XAxisProps;
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
  const { areas, data, height, timezone, unit, xAxis } = props;

  const theme = useTheme();

  const xAxisTickFormatter = (t: number) => {
    return DateTime.fromMillis(t, { zone: timezone }).toFormat(
      xAxis.tickFormat
    );
  };

  const tooltipLabelFormatter = (t: number) => {
    return DateTime.fromMillis(t, { zone: timezone }).toFormat(
      'LLL dd, yyyy, h:mm a'
    );
  };

  const tooltipValueFormatter = (value: number) => `${roundTo(value)}${unit}`;

  const CustomTooltip = ({
    active,
    label,
    payload,
  }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      return (
        <StyledPaper>
          <Typography>{tooltipLabelFormatter(label)}</Typography>
          {payload.map((item) => (
            <Typography fontFamily={theme.font.bold} key={item.dataKey}>
              {item.dataKey}: {tooltipValueFormatter(item.value)}
            </Typography>
          ))}
        </StyledPaper>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer height={height} width="100%">
      <_AreaChart data={data}>
        <CartesianGrid
          stroke={theme.color.grey7}
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          dataKey="t"
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
        {areas.map(({ color, dataKey }) => (
          <Area
            dataKey={dataKey}
            fill={color}
            isAnimationActive={false}
            key={dataKey}
            stroke={color}
            type="monotone"
          />
        ))}
      </_AreaChart>
    </ResponsiveContainer>
  );
};

const StyledPaper = styled(Paper, {
  label: 'StyledPaper',
})(({ theme }) => ({
  border: `1px solid ${theme.color.border2}`,
  padding: theme.spacing(1),
}));

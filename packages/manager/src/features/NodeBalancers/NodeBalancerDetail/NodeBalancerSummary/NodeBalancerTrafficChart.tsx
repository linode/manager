import { Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';

import { Box } from 'src/components/Box';
import { Paper } from 'src/components/Paper';
import { roundTo } from 'src/utilities/roundTo';

interface NodeBalancerTrafficChartProps {
  data: any;
  timezone: string;
  unit: string;
}

export const NodeBalancerTrafficChart = (
  props: NodeBalancerTrafficChartProps
) => {
  const { data, timezone, unit } = props;

  const theme = useTheme();

  const xAxisTickFormatter = (t: number) => {
    return DateTime.fromMillis(t, { zone: timezone }).toFormat('hh a');
  };

  const tooltipLabelFormatter = (t: number) => {
    return DateTime.fromMillis(t, { zone: timezone }).toFormat(
      'LLL dd, yyyy, h:mm a'
    );
  };

  const tooltipValueFormatter = (value: number) =>
    `${roundTo(value)} ${unit}/s`;

  const CustomTooltip = ({
    active,
    label,
    payload,
  }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      return (
        <StyledPaper>
          <Typography>{tooltipLabelFormatter(label)}</Typography>
          <Typography fontFamily={theme.font.bold}>
            Traffic In: {tooltipValueFormatter(payload[0].value)} <br />
            Traffic Out: {tooltipValueFormatter(payload[1].value)}
          </Typography>
        </StyledPaper>
      );
    }

    return null;
  };

  return (
    <Box marginLeft={-4}>
      <ResponsiveContainer height={300} width="100%">
        <AreaChart data={data}>
          <CartesianGrid
            stroke={theme.color.grey7}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="t"
            domain={['dataMin', 'dataMax']}
            interval="preserveEnd"
            minTickGap={60}
            scale="time"
            stroke={theme.color.label}
            tickFormatter={xAxisTickFormatter}
            type="number"
          />
          <YAxis dataKey="Traffic In" stroke={theme.color.label} />
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
          <Area
            dataKey="Traffic In"
            fill={theme.graphs.network.inbound}
            isAnimationActive={false}
            stroke={theme.graphs.network.inbound}
            type="monotone"
          />
          <Area
            dataKey="Traffic Out"
            fill={theme.graphs.network.outbound}
            isAnimationActive={false}
            stroke={theme.graphs.network.outbound}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

const StyledPaper = styled(Paper, {
  label: 'StyledPaper',
})(({ theme }) => ({
  border: `1px solid ${theme.color.border2}`,
  padding: theme.spacing(1),
}));

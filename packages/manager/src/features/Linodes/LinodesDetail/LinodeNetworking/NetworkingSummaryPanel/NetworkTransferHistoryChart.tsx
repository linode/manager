import { useTheme } from '@mui/material';
import { DateTime } from 'luxon';
import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Box } from 'src/components/Box';
import { NetworkUnit } from 'src/features/Longview/shared/utilities';
import { roundTo } from 'src/utilities/roundTo';

interface NetworkTransferHistoryChartProps {
  data: [number, null | number][];
  timezone: string;
  unit: NetworkUnit;
}

export const NetworkTransferHistoryChart = (
  props: NetworkTransferHistoryChartProps
) => {
  const { data, timezone, unit } = props;

  const theme = useTheme();

  const xAxisTickFormatter = (t: number) => {
    return DateTime.fromMillis(t, { zone: timezone }).toFormat('LLL dd');
  };

  const tooltipLabelFormatter = (t: number) => {
    return DateTime.fromMillis(t, { zone: timezone }).toFormat(
      'LLL dd, yyyy, h:mm a'
    );
  };

  const tooltipValueFormatter = (value: number) =>
    `${roundTo(value)} ${unit}/s`;

  return (
    <Box marginLeft={-5}>
      <ResponsiveContainer height={190} width="100%">
        <AreaChart data={data}>
          <CartesianGrid
            stroke={theme.color.grey7}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="t"
            domain={['dataMin', 'dataMax']}
            interval="equidistantPreserveStart"
            minTickGap={15}
            scale="time"
            stroke={theme.color.label}
            tickFormatter={xAxisTickFormatter}
            type="number"
          />
          <YAxis dataKey="Public Outbound Traffic" stroke={theme.color.label} />
          <Tooltip
            contentStyle={{
              color: '#606469',
            }}
            itemStyle={{
              color: '#606469',
              fontFamily: theme.font.bold,
            }}
            formatter={tooltipValueFormatter}
            labelFormatter={tooltipLabelFormatter}
          />
          <Area
            dataKey="Public Outbound Traffic"
            fill="#1CB35C"
            isAnimationActive={false}
            stroke="#1CB35C"
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

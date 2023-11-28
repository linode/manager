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
    <Box marginLeft={-4}>
      <ResponsiveContainer height={190} width="100%">
        <AreaChart
          margin={{
            bottom: 5,
            left: 0,
            right: 0,
            top: 5,
          }}
          data={data}
        >
          <CartesianGrid
            stroke="#dbdde1"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="t"
            domain={['dataMin', 'dataMax']}
            interval="equidistantPreserveStart"
            minTickGap={15}
            scale="time"
            stroke="#606469"
            tickFormatter={xAxisTickFormatter}
            type="number"
          />
          <YAxis dataKey="Public Outbound Traffic" stroke="#606469" />
          <Tooltip
            formatter={tooltipValueFormatter}
            labelFormatter={tooltipLabelFormatter}
          />
          <Area
            dataKey="Public Outbound Traffic"
            fill="#1CB35C"
            stroke="#1CB35C"
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

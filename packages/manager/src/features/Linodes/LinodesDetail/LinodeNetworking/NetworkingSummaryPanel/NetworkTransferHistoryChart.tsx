import { DateTime } from 'luxon';
import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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

  const dateFormatter = (t: number) => {
    return DateTime.fromMillis(t, { zone: timezone }).toFormat('LLL dd');
  };

  const tooltipDateFormatter = (t: number) => {
    return DateTime.fromMillis(t, { zone: timezone }).toFormat(
      'LLL dd, yyyy, h:mm a'
    );
  };

  return (
    <AreaChart
      margin={{
        bottom: 5,
        left: 0,
        right: 0,
        top: 5,
      }}
      data={data}
      height={190}
      width={584}
    >
      <CartesianGrid stroke="#dbdde1" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="t"
        domain={['dataMin', 'dataMax']}
        interval="equidistantPreserveStart"
        minTickGap={15}
        scale="time"
        tickFormatter={dateFormatter}
        type="number"
      />
      <YAxis dataKey="Public Outbound Traffic" />
      <Tooltip
        formatter={(value: number) => `${roundTo(value)} ${unit}/s`}
        labelFormatter={tooltipDateFormatter}
      />
      <Area
        dataKey="Public Outbound Traffic"
        fill="#1CB35C"
        stroke="#1CB35C"
        type="monotone"
      />
    </AreaChart>
  );
};

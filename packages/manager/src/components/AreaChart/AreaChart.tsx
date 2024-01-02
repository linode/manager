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
  ariaLabel: string;
  data: any;
  height: number;
  showLegend?: boolean;
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
  const {
    areas,
    ariaLabel,
    data,
    height,
    showLegend,
    timezone,
    unit,
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

  const tooltipLabelFormatter = (timestamp: number) => {
    return DateTime.fromMillis(timestamp, { zone: timezone }).toFormat(
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
          {showLegend && (
            <Legend
              formatter={(value) => (
                <span style={{ color: theme.color.label }}>{value}</span>
              )}
              iconType="square"
              onClick={(props) => handleLegendClick(props.dataKey)}
              wrapperStyle={{ left: 25 }}
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
        unit={unit}
      />
    </>
  );
};

const StyledPaper = styled(Paper, {
  label: 'StyledPaper',
})(({ theme }) => ({
  border: `1px solid ${theme.color.border2}`,
  padding: theme.spacing(1),
}));

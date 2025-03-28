import { Paper } from '@linode/ui';
import { getMetrics } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { AreaChart } from 'src/components/AreaChart/AreaChart';
import {
  convertNetworkToUnit,
  formatBitsPerSecond,
  generateNetworkUnits,
} from 'src/features/Longview/shared/utilities';

import { StatsPanel } from './StatsPanel';

import type { Stats } from '@linode/api-v4/lib/linodes';
import type { Metrics } from '@linode/utilities';
import type { Theme } from '@mui/material/styles';
import type { NetworkTimeData } from 'src/components/AreaChart/types';
import type { NetworkUnit } from 'src/features/Longview/shared/utilities';

export interface TotalTrafficProps {
  combinedTraffic: string;
  inTraffic: string;
  outTraffic: string;
}

export interface ChartProps {
  loading: boolean;
  rangeSelection: string;
  timezone: string;
}

interface Props extends ChartProps {
  rangeSelection: string;
  stats?: Stats;
  timezone: string;
  xAxisTickFormat: string;
}

interface NetworkMetrics {
  privateIn: Metrics;
  privateOut: Metrics;
  publicIn: Metrics;
  publicOut: Metrics;
}

interface NetworkStats {
  privateIn: [number, number][];
  privateOut: [number, number][];
  publicIn: [number, number][];
  publicOut: [number, number][];
}

const _getMetrics = (data: NetworkStats) => {
  return {
    privateIn: getMetrics(data.privateIn),
    privateOut: getMetrics(data.privateOut),
    publicIn: getMetrics(data.publicIn),
    publicOut: getMetrics(data.publicOut),
  };
};

export const NetworkGraphs = (props: Props) => {
  const { rangeSelection, stats, xAxisTickFormat, ...rest } = props;

  const theme = useTheme();

  const v4Data: NetworkStats = {
    privateIn: stats?.data.netv4.private_in ?? [],
    privateOut: stats?.data.netv4.private_out ?? [],
    publicIn: stats?.data.netv4.in ?? [],
    publicOut: stats?.data.netv4.out ?? [],
  };

  const v6Data: NetworkStats = {
    privateIn: stats?.data.netv6.private_in ?? [],
    privateOut: stats?.data.netv6.private_out ?? [],
    publicIn: stats?.data.netv6.in ?? [],
    publicOut: stats?.data.netv6.out ?? [],
  };

  const v4Metrics = _getMetrics(v4Data);
  const v6Metrics = _getMetrics(v6Data);

  // Convert to bytes, which is what generateNetworkUnits expects.
  const maxV4InBytes =
    Math.max(
      v4Metrics.publicIn.max,
      v4Metrics.publicOut.max,
      v4Metrics.privateIn.max,
      v4Metrics.privateOut.max
    ) / 8;
  const v4Unit = generateNetworkUnits(maxV4InBytes);

  // Convert to bytes, which is what generateNetworkUnits expects.
  const maxV6InBytes =
    Math.max(
      v6Metrics.publicIn.max,
      v6Metrics.publicOut.max,
      v6Metrics.privateIn.max,
      v6Metrics.privateOut.max
    ) / 8;
  const v6Unit = generateNetworkUnits(maxV6InBytes);

  const commonGraphProps = {
    rangeSelection,
    theme,
    timezone: props.timezone,
    xAxisTickFormat,
  };

  return (
    <>
      <Grid
        size={{
          md: 6,
          xs: 12,
        }}
      >
        <Paper variant="outlined" sx={{ height: 500 }}>
          <StatsPanel
            renderBody={() => (
              <Graph
                ariaLabel="IPv4 Network Traffic Graph"
                data={v4Data}
                metrics={v4Metrics}
                unit={v4Unit}
                {...commonGraphProps}
              />
            )}
            title={`Network — IPv4 (${v4Unit}/s)`}
            {...rest}
          />
        </Paper>
      </Grid>
      <Grid
        size={{
          md: 6,
          xs: 12,
        }}
      >
        <Paper variant="outlined" sx={{ height: 500 }}>
          <StatsPanel
            renderBody={() => (
              <Graph
                ariaLabel="IPv6 Network Traffic Graph"
                data={v6Data}
                metrics={v6Metrics}
                unit={v6Unit}
                {...commonGraphProps}
              />
            )}
            title={`Network — IPv6 (${v6Unit}/s)`}
            {...rest}
          />
        </Paper>
      </Grid>
    </>
  );
};

interface GraphProps {
  ariaLabel: string;
  data: NetworkStats;
  metrics: NetworkMetrics;
  rangeSelection: string;
  theme: Theme;
  timezone: string;
  unit: NetworkUnit;
  xAxisTickFormat: string;
}

const Graph = (props: GraphProps) => {
  const {
    ariaLabel,
    data,
    metrics,
    theme,
    timezone,
    unit,
    xAxisTickFormat,
  } = props;

  const format = formatBitsPerSecond;

  const convertNetworkData = (value: number) => {
    return convertNetworkToUnit(value, unit);
  };

  const timeData: NetworkTimeData[] = [];

  for (let i = 0; i < data.publicIn.length; i++) {
    timeData.push({
      'Private In': convertNetworkData(data.privateIn[i][1]),
      'Private Out': convertNetworkData(data.privateOut[i][1]),
      'Public In': convertNetworkData(data.publicIn[i][1]),
      'Public Out': convertNetworkData(data.publicOut[i][1]),
      timestamp: data.publicIn[i][0],
    });
  }

  return (
    <AreaChart
      areas={[
        {
          color: theme.graphs.darkGreen,
          dataKey: 'Public In',
        },
        {
          color: theme.graphs.lightGreen,
          dataKey: 'Public Out',
        },
        {
          color: theme.graphs.purple,
          dataKey: 'Private In',
        },
        {
          color: theme.graphs.yellow,
          dataKey: 'Private Out',
        },
      ]}
      legendRows={[
        {
          data: metrics.publicIn,
          format,
          legendColor: theme.graphs.darkGreen,
          legendTitle: 'Public In',
        },
        {
          data: metrics.publicOut,
          format,
          legendColor: theme.graphs.lightGreen,
          legendTitle: 'Public Out',
        },
        {
          data: metrics.privateIn,
          format,
          legendColor: theme.graphs.purple,
          legendTitle: 'Private In',
        },
        {
          data: metrics.privateOut,
          format,
          legendColor: theme.graphs.yellow,
          legendTitle: 'Private Out',
        },
      ]}
      xAxis={{
        tickFormat: xAxisTickFormat,
        tickGap: 60,
      }}
      ariaLabel={ariaLabel}
      data={timeData}
      showLegend
      timezone={timezone}
      unit={` ${unit}/s`}
    />
  );
};

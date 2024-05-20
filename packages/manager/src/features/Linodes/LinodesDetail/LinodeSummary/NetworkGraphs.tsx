import { Stats } from '@linode/api-v4/lib/linodes';
import { Theme, styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { AreaChart } from 'src/components/AreaChart/AreaChart';
import { NetworkTimeData } from 'src/components/AreaChart/types';
import { Box } from 'src/components/Box';
import {
  NetworkUnit,
  convertNetworkToUnit,
  formatBitsPerSecond,
  generateNetworkUnits,
} from 'src/features/Longview/shared/utilities';
import { Metrics, getMetrics } from 'src/utilities/statMetrics';

import { StatsPanel } from './StatsPanel';

export interface TotalTrafficProps {
  combinedTraffic: string;
  inTraffic: string;
  outTraffic: string;
}

export interface ChartProps {
  height: number;
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
    chartHeight: props.height,
    rangeSelection,
    theme,
    timezone: props.timezone,
    xAxisTickFormat,
  };

  return (
    <StyledGraphGrid container spacing={4} xs={12}>
      <StyledGrid xs={12}>
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
      </StyledGrid>
      <StyledGrid xs={12}>
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
      </StyledGrid>
    </StyledGraphGrid>
  );
};

interface GraphProps {
  ariaLabel: string;
  chartHeight: number;
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
    <Box marginLeft={-4} marginTop={2}>
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
            legendColor: 'darkGreen',
            legendTitle: 'Public In',
          },
          {
            data: metrics.publicOut,
            format,
            legendColor: 'lightGreen',
            legendTitle: 'Public Out',
          },
          {
            data: metrics.privateIn,
            format,
            legendColor: 'purple',
            legendTitle: 'Private In',
          },
          {
            data: metrics.privateOut,
            format,
            legendColor: 'yellow',
            legendTitle: 'Private Out',
          },
        ]}
        xAxis={{
          tickFormat: xAxisTickFormat,
          tickGap: 60,
        }}
        ariaLabel={ariaLabel}
        data={timeData}
        height={420}
        showLegend
        timezone={timezone}
        unit={` ${unit}/s`}
      />
    </Box>
  );
};

const StyledGrid = styled(Grid, {
  label: 'StyledGrid',
})(({ theme }) => ({
  '& h2': {
    fontSize: '1rem',
  },
  '&.MuiGrid-item': {
    padding: theme.spacing(2),
  },
  backgroundColor: theme.bg.white,
  border: `solid 1px ${theme.borderColors.divider}`,
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  [theme.breakpoints.down(1100)]: {
    '&:first-of-type': {
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(2),
    },
  },
  [theme.breakpoints.up(1100)]: {
    '&:first-of-type': {
      marginRight: theme.spacing(2),
    },
  },
}));

const StyledGraphGrid = styled(Grid, { label: 'StyledGraphGrid' })(
  ({ theme }) => ({
    flexWrap: 'nowrap',
    margin: 0,
    padding: 0,
    [theme.breakpoints.down(1100)]: {
      flexWrap: 'wrap',
      marginTop: `-${theme.spacing(2)}`,
    },
  })
);

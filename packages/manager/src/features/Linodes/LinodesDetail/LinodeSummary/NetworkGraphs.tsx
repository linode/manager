import { Stats } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme, Theme } from '@mui/material/styles';
import { map, pathOr } from 'ramda';
import * as React from 'react';

import { LineGraph } from 'src/components/LineGraph/LineGraph';
import {
  convertNetworkToUnit,
  formatBitsPerSecond,
  formatNetworkTooltip,
  generateNetworkUnits,
} from 'src/features/Longview/shared/utilities';
import {
  Metrics,
  getMetrics,
  getTotalTraffic,
} from 'src/utilities/statMetrics';
import { readableBytes } from 'src/utilities/unitConversions';
import { StatsPanel } from './StatsPanel';

export interface TotalTrafficProps {
  combinedTraffic: string;
  inTraffic: string;
  outTraffic: string;
}

const formatTotalTraffic = (value: number) =>
  readableBytes(value, { base10: true }).formatted;

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
    privateOut: getMetrics(data.privateOut ?? []),
    publicIn: getMetrics(data.publicIn),
    publicOut: getMetrics(data.publicOut),
  };
};

export const NetworkGraphs = (props: Props) => {
  const { rangeSelection, stats, ...rest } = props;

  const theme = useTheme();

  const v4Data: NetworkStats = {
    privateIn: pathOr([], ['data', 'netv4', 'private_in'], stats),
    privateOut: pathOr([], ['data', 'netv4', 'private_out'], stats),
    publicIn: pathOr([], ['data', 'netv4', 'in'], stats),
    publicOut: pathOr([], ['data', 'netv4', 'out'], stats),
  };

  const v6Data: NetworkStats = {
    privateIn: pathOr([], ['data', 'netv6', 'private_in'], stats),
    privateOut: pathOr([], ['data', 'netv6', 'private_out'], stats),
    publicIn: pathOr([], ['data', 'netv6', 'in'], stats),
    publicOut: pathOr([], ['data', 'netv6', 'out'], stats),
  };

  const v4Metrics = _getMetrics(v4Data);
  const v6Metrics = _getMetrics(v6Data);

  const v4totalTraffic: TotalTrafficProps = map(
    formatTotalTraffic,
    getTotalTraffic(
      v4Metrics.publicIn.total,
      v4Metrics.publicOut.total,
      v4Data.publicIn.length,
      v6Metrics.publicIn.total,
      v6Metrics.publicOut.total
    )
  );

  const v6totalTraffic: TotalTrafficProps = map(
    formatTotalTraffic,
    getTotalTraffic(
      v6Metrics.publicIn.total,
      v6Metrics.publicOut.total,
      v6Metrics.publicIn.length
    )
  );

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
              totalTraffic={v4totalTraffic}
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
              totalTraffic={v6totalTraffic}
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
  totalTraffic: TotalTrafficProps;
  unit: string;
}

const Graph = (props: GraphProps) => {
  const {
    ariaLabel,
    chartHeight,
    data,
    metrics,
    rangeSelection,
    theme,
    timezone,
    unit,
  } = props;

  const format = formatBitsPerSecond;

  const convertNetworkData = (value: number) => {
    return convertNetworkToUnit(value, unit as any);
  };

  /**
   * formatNetworkTooltip is a helper method from Longview, where
   * data is expected in bytes. The method does the rounding, unit conversions, etc.
   * that we want, but it first multiplies by 8 to convert to bits.
   * APIv4 returns this data in bits to begin with,
   * so we have to preemptively divide by 8 to counter the conversion inside the helper.
   *
   */
  const _formatTooltip = (valueInBytes: number) =>
    formatNetworkTooltip(valueInBytes / 8);

  const convertedPublicIn = data.publicIn;
  const convertedPublicOut = data.publicOut;
  const convertedPrivateIn = data.privateIn;
  const convertedPrivateOut = data.privateOut;

  return (
    <LineGraph
      data={[
        {
          backgroundColor: theme.graphs.network.inbound,
          borderColor: 'transparent',
          data: convertedPublicIn,
          label: 'Public In',
        },
        {
          backgroundColor: theme.graphs.network.outbound,
          borderColor: 'transparent',
          data: convertedPublicOut,
          label: 'Public Out',
        },
        {
          backgroundColor: theme.graphs.purple,
          borderColor: 'transparent',
          data: convertedPrivateIn,
          label: 'Private In',
        },
        {
          backgroundColor: theme.graphs.yellow,
          borderColor: 'transparent',
          data: convertedPrivateOut,
          label: 'Private Out',
        },
      ]}
      legendRows={[
        {
          data: metrics.publicIn,
          format,
        },
        {
          data: metrics.publicOut,
          format,
        },
        {
          data: metrics.privateIn,
          format,
        },
        {
          data: metrics.privateOut,
          format,
        },
      ]}
      accessibleDataTable={{ unit: 'Kb/s' }}
      ariaLabel={ariaLabel}
      chartHeight={chartHeight}
      formatData={convertNetworkData}
      formatTooltip={_formatTooltip}
      showToday={rangeSelection === '24'}
      timezone={timezone}
      unit={`/s`}
    />
  );
};

const StyledGrid = styled(Grid, { label: 'StyledGrid' })(({ theme }) => ({
  '& h2': {
    fontSize: '1rem',
  },
  '&.MuiGrid-item': {
    padding: theme.spacing(2),
  },
  backgroundColor: theme.bg.offWhite,
  border: `solid 1px ${theme.borderColors.divider}`,
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

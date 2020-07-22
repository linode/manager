import { Stats } from '@linode/api-v4/lib/linodes';
import { map, pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import {
  makeStyles,
  Theme,
  WithTheme,
  withTheme
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LineGraph from 'src/components/LineGraph';
import {
  convertNetworkToUnit,
  formatBitsPerSecond,
  formatNetworkTooltip,
  generateNetworkUnits
} from 'src/features/Longview/shared/utilities';
import {
  getMetrics,
  getTotalTraffic,
  Metrics
} from 'src/utilities/statMetrics';
import { readableBytes } from 'src/utilities/unitConversions';
import StatsPanel from './StatsPanel';
import TotalTraffic, { TotalTrafficProps } from './TotalTraffic';
import { ChartProps } from './types';

const formatTotalTraffic = (value: number) =>
  readableBytes(value, { base10: true }).formatted;

const useStyles = makeStyles((theme: Theme) => ({
  chart: {
    position: 'relative',
    paddingLeft: theme.spacing(1)
  },
  totalTraffic: {
    margin: '12px'
  }
}));

interface Props extends ChartProps {
  timezone: string;
  rangeSelection: string;
  stats?: Stats;
}

export type CombinedProps = Props & WithTheme;

interface NetworkMetrics {
  publicIn: Metrics;
  publicOut: Metrics;
  privateIn: Metrics;
  privateOut: Metrics;
}

interface NetworkStats {
  publicIn: [number, number][];
  publicOut: [number, number][];
  privateIn: [number, number][];
  privateOut: [number, number][];
}

const _getMetrics = (data: NetworkStats) => {
  return {
    publicIn: getMetrics(data.publicIn),
    publicOut: getMetrics(data.publicOut),
    privateIn: getMetrics(data.privateIn),
    privateOut: getMetrics(data.privateOut ?? [])
  };
};

export const NetworkGraph: React.FC<CombinedProps> = props => {
  const { rangeSelection, stats, theme, ...rest } = props;

  const v4Data: NetworkStats = {
    publicIn: pathOr([], ['data', 'netv4', 'in'], stats),
    publicOut: pathOr([], ['data', 'netv4', 'out'], stats),
    privateIn: pathOr([], ['data', 'netv4', 'private_in'], stats),
    privateOut: pathOr([], ['data', 'netv4', 'private_out'], stats)
  };

  const v6Data: NetworkStats = {
    publicIn: pathOr([], ['data', 'netv6', 'in'], stats),
    publicOut: pathOr([], ['data', 'netv6', 'out'], stats),
    privateIn: pathOr([], ['data', 'netv6', 'private_in'], stats),
    privateOut: pathOr([], ['data', 'netv6', 'private_out'], stats)
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
    timezone: props.timezone,
    theme,
    chartHeight: props.height,
    rangeSelection
  };

  return (
    <>
      <StatsPanel
        title={`IPv4 Traffic (${v4Unit}/s)`}
        renderBody={() => (
          <Graph
            data={v4Data}
            unit={v4Unit}
            totalTraffic={v4totalTraffic}
            metrics={v4Metrics}
            {...commonGraphProps}
          />
        )}
        {...rest}
      />
      <StatsPanel
        title={`IPv6 Traffic (${v6Unit}/s)`}
        renderBody={() => (
          <Graph
            data={v6Data}
            unit={v6Unit}
            totalTraffic={v6totalTraffic}
            metrics={v6Metrics}
            {...commonGraphProps}
          />
        )}
        {...rest}
      />
    </>
  );
};

interface GraphProps {
  timezone: string;
  data: NetworkStats;
  unit: string;
  theme: Theme;
  rangeSelection: string;
  chartHeight: number;
  totalTraffic: TotalTrafficProps;
  metrics: NetworkMetrics;
}

const Graph: React.FC<GraphProps> = props => {
  const classes = useStyles();
  const {
    chartHeight,
    data,
    metrics,
    rangeSelection,
    theme,
    timezone,
    unit,
    totalTraffic
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
    <React.Fragment>
      <div className={classes.chart}>
        <LineGraph
          timezone={timezone}
          chartHeight={chartHeight}
          unit={`/s`}
          formatData={convertNetworkData}
          formatTooltip={_formatTooltip}
          showToday={rangeSelection === '24'}
          data={[
            {
              borderColor: 'transparent',
              backgroundColor: theme.graphs.network.inbound,
              data: convertedPublicIn,
              label: 'Public Inbound'
            },
            {
              borderColor: 'transparent',
              backgroundColor: theme.graphs.network.outbound,
              data: convertedPublicOut,
              label: 'Public Outbound'
            },
            {
              borderColor: 'transparent',
              backgroundColor: theme.graphs.purple,
              data: convertedPrivateIn,
              label: 'Private Inbound'
            },
            {
              borderColor: 'transparent',
              backgroundColor: theme.graphs.yellow,
              data: convertedPrivateOut,
              label: 'Private Outbound'
            }
          ]}
          legendRows={[
            {
              data: metrics.publicIn,
              format
            },
            {
              data: metrics.publicOut,
              format
            },
            {
              data: metrics.privateIn,
              format
            },
            {
              data: metrics.privateOut,
              format
            }
          ]}
        />
      </div>
      {rangeSelection === '24' && (
        <Grid item xs={12} lg={6} className={classes.totalTraffic}>
          <TotalTraffic
            inTraffic={totalTraffic.inTraffic}
            outTraffic={totalTraffic.outTraffic}
            combinedTraffic={totalTraffic.combinedTraffic}
          />
        </Grid>
      )}
    </React.Fragment>
  );
};

const enhanced = compose<CombinedProps, Props>(withTheme, React.memo);
export default enhanced(NetworkGraph);

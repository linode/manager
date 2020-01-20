import { map, pathOr } from 'ramda';
import * as React from 'react';
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
  generateNetworkUnits
} from 'src/features/Longview/shared/utilities';
import {
  formatBitsPerSecond,
  formatBytes,
  getMetrics,
  getTotalTraffic,
  Metrics
} from 'src/utilities/statMetrics';
import StatsPanel from './StatsPanel';
import TotalTraffic, { TotalTrafficProps } from './TotalTraffic';
import { ChartProps } from './types';

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
  stats: any;
}

export type CombinedProps = Props & WithTheme;

interface NetworkMetrics {
  publicIn: Metrics;
  publicOut: Metrics;
  privateIn: Metrics;
  privateOut: Metrics;
}

const _getMetrics = (data: any) => {
  return {
    publicIn: getMetrics(data.publicIn),
    publicOut: getMetrics(data.publicOut),
    privateIn: getMetrics(data.privateIn),
    privateOut: data.privateOut && getMetrics(data.privateOut)
  };
};

export const NetworkGraph: React.FC<CombinedProps> = props => {
  const { rangeSelection, stats, timezone, theme, ...rest } = props;

  const v4Data = {
    publicIn: pathOr([], ['data', 'netv4', 'in'], stats),
    publicOut: pathOr([], ['data', 'netv4', 'out'], stats),
    privateIn: pathOr([], ['data', 'netv4', 'private_in'], stats),
    privateOut: pathOr([], ['data', 'netv4', 'private_out'], stats)
  };

  const v6Data = {
    publicIn: pathOr([], ['data', 'netv6', 'in'], stats),
    publicOut: pathOr([], ['data', 'netv6', 'out'], stats),
    privateIn: pathOr([], ['data', 'netv6', 'private_in'], stats),
    privateOut: pathOr([], ['data', 'netv6', 'private_out'], stats)
  };

  const v4Metrics = _getMetrics(v4Data);
  const v6Metrics = _getMetrics(v6Data);

  const v4totalTraffic: TotalTrafficProps = map(
    formatBytes,
    getTotalTraffic(
      v4Metrics.publicIn.total,
      v4Metrics.publicOut.total,
      v4Data.publicIn.length,
      v6Metrics.publicIn.total,
      v6Metrics.publicOut.total
    )
  );

  const v6totalTraffic: TotalTrafficProps = map(
    formatBytes,
    getTotalTraffic(
      v6Metrics.publicIn.total,
      v6Metrics.publicOut.total,
      v6Metrics.publicIn.length
    )
  );

  const v4Unit = generateNetworkUnits(
    Math.max(
      v4Metrics.publicIn.max,
      v4Metrics.publicOut.max,
      v4Metrics.privateIn.max,
      v4Metrics.privateOut.max
    )
  );

  const v6Unit = generateNetworkUnits(
    Math.max(
      v6Metrics.publicIn.max,
      v6Metrics.publicOut.max,
      v6Metrics.privateIn.max,
      v6Metrics.privateOut?.max ?? 0
    )
  );

  const commonGraphProps = {
    timezone,
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
  data: any;
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

  const convertNetworkData = (point: any) => {
    return [point[0], convertNetworkToUnit(point[1], unit as any)];
  };
  const convertedPublicIn = data.publicIn.map(convertNetworkData);
  const convertedPublicOut = data.publicOut.map(convertNetworkData);
  const convertedPrivateIn = data.privateIn.map(convertNetworkData);
  const convertedPrivateOut = data.privateOut?.map(convertNetworkData) ?? [];

  return (
    <React.Fragment>
      <div className={classes.chart}>
        <LineGraph
          timezone={timezone}
          chartHeight={chartHeight}
          unit={`${unit}/s`}
          showToday={rangeSelection === '24'}
          data={[
            {
              borderColor: theme.graphs.blueBorder,
              backgroundColor: theme.graphs.blue,
              data: convertedPublicIn,
              label: 'Public Inbound'
            },
            {
              borderColor: theme.graphs.greenBorder,
              backgroundColor: theme.graphs.green,
              data: convertedPublicOut,
              label: 'Public Outbound'
            },
            {
              borderColor: theme.graphs.purpleBorder,
              backgroundColor: theme.graphs.purple,
              data: convertedPrivateIn,
              label: 'Private Inbound'
            },
            {
              borderColor: theme.graphs.yellowBorder,
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

export default withTheme(NetworkGraph);

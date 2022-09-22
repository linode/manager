import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme, useTheme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LineGraph from 'src/components/LineGraph';
import MetricsDisplay from 'src/components/LineGraph/MetricsDisplay';
import getUserTimezone from 'src/utilities/getUserTimezone';
import PendingIcon from 'src/assets/icons/pending.svg';
import { formatBitsPerSecond } from 'src/features/Longview/shared/utilities';
import { ExtendedNodeBalancer } from 'src/features/NodeBalancers/types';
import { useProfile } from 'src/queries/profile';
import { formatNumber, getMetrics } from 'src/utilities/statMetrics';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  NODEBALANCER_STATS_NOT_READY_API_MESSAGE,
  useNodeBalancerStats,
} from 'src/queries/nodebalancers';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    padding: theme.spacing(2),
  },
  chart: {
    position: 'relative',
    width: '100%',
    paddingLeft: theme.spacing(1),
  },
  bottomLegend: {
    margin: `${theme.spacing(2)}px ${theme.spacing(1)}px ${theme.spacing(1)}px`,
    padding: 10,
    color: '#777',
    backgroundColor: theme.bg.offWhite,
    border: `1px solid ${theme.color.border3}`,
    fontSize: 14,
  },
  graphControls: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.up('md')]: {
      margin: `${theme.spacing(2)}px 0`,
    },
  },
  title: {
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
    },
  },
  panel: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: theme.spacing(),
  },
}));

const Loading = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 300,
    }}
  >
    <CircleProgress mini />
  </div>
);

const STATS_NOT_READY_TITLE =
  'Stats for this NodeBalancer are not available yet';

interface Props {
  nodeBalancer: ExtendedNodeBalancer;
}

const TablesPanel: React.FC<Props> = ({ nodeBalancer }) => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const { data: profile } = useProfile();
  const timezone = getUserTimezone(profile);

  const { data: stats, isLoading, error } = useNodeBalancerStats(
    nodeBalancer.id,
    nodeBalancer.created
  );

  const statsErrorString = error
    ? getAPIErrorOrDefault(error, 'Unable to load stats')[0].reason
    : undefined;

  const statsNotReadyError =
    statsErrorString === NODEBALANCER_STATS_NOT_READY_API_MESSAGE;

  const renderConnectionsChart = () => {
    const data = stats?.data.connections ?? [];

    if (statsNotReadyError) {
      return (
        <ErrorState
          CustomIcon={PendingIcon}
          CustomIconStyles={{ width: 64, height: 64 }}
          errorText={
            <>
              <div>
                <Typography variant="h2" className={classes.emptyText}>
                  {STATS_NOT_READY_TITLE}
                </Typography>
              </div>
              <div>
                <Typography variant="body1" className={classes.emptyText}>
                  Connection stats will be available shortly
                </Typography>
              </div>
            </>
          }
        />
      );
    }

    if (statsErrorString && !statsNotReadyError) {
      return <ErrorState errorText={statsErrorString} />;
    }

    if (isLoading) {
      return <Loading />;
    }

    const metrics = getMetrics(data);

    return (
      <React.Fragment>
        <div className={classes.chart}>
          <LineGraph
            ariaLabel="Connections Graph"
            timezone={timezone}
            showToday={true}
            data={[
              {
                label: 'Connections',
                borderColor: 'transparent',
                backgroundColor: theme.graphs.purple,
                data,
              },
            ]}
          />
        </div>
        <div className={classes.bottomLegend}>
          <Grid container>
            <Grid item xs={12}>
              <MetricsDisplay
                rows={[
                  {
                    legendTitle: 'Connections',
                    legendColor: 'purple',
                    data: metrics,
                    format: formatNumber,
                  },
                ]}
              />
            </Grid>
          </Grid>
        </div>
      </React.Fragment>
    );
  };

  const renderTrafficChart = () => {
    const trafficIn = stats?.data.traffic.in ?? [];
    const trafficOut = stats?.data.traffic.out ?? [];

    if (statsNotReadyError) {
      return (
        <ErrorState
          CustomIcon={PendingIcon}
          CustomIconStyles={{ width: 64, height: 64 }}
          errorText={
            <>
              <div>
                <Typography variant="h2" className={classes.emptyText}>
                  {STATS_NOT_READY_TITLE}
                </Typography>
              </div>
              <div>
                <Typography variant="body1" className={classes.emptyText}>
                  Traffic stats will be available shortly
                </Typography>
              </div>
            </>
          }
        />
      );
    }

    if (statsErrorString && !statsNotReadyError) {
      return <ErrorState errorText={statsErrorString} />;
    }

    if (isLoading) {
      return <Loading />;
    }

    return (
      <React.Fragment>
        <div className={classes.chart}>
          <LineGraph
            ariaLabel="Traffic Graph"
            timezone={timezone}
            showToday={true}
            data={[
              {
                label: 'Traffic In',
                borderColor: 'transparent',
                backgroundColor: theme.graphs.network.inbound,
                data: trafficIn,
              },
              {
                label: 'Traffic Out',
                borderColor: 'transparent',
                backgroundColor: theme.graphs.network.outbound,
                data: trafficOut,
              },
            ]}
          />
        </div>
        <div className={classes.bottomLegend}>
          <MetricsDisplay
            rows={[
              {
                legendTitle: 'Inbound',
                legendColor: 'darkGreen',
                data: getMetrics(trafficIn),
                format: formatBitsPerSecond,
              },
              {
                legendTitle: 'Outbound',
                legendColor: 'lightGreen',
                data: getMetrics(trafficOut),
                format: formatBitsPerSecond,
              },
            ]}
          />
        </div>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <div className={classes.graphControls}>
        <Typography className={classes.title} variant="h2">
          Graphs
        </Typography>
      </div>
      <Paper className={classes.panel}>
        <Typography variant="h3" className={classes.header}>
          Connections (CXN/s, 5 min avg.)
        </Typography>
        {renderConnectionsChart()}
      </Paper>
      <Paper className={classes.panel}>
        <Typography variant="h3" className={classes.header}>
          Traffic (bits/s, 5 min avg.)
        </Typography>
        {renderTrafficChart()}
      </Paper>
    </React.Fragment>
  );
};

export default TablesPanel;

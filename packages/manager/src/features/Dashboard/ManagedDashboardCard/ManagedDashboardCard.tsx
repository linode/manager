import { ManagedServiceMonitor } from 'linode-js-sdk/lib/managed';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import ManagedContainer, {
  DispatchProps
} from 'src/containers/managedServices.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import DashboardCard from '../DashboardCard';
import MonitorStatus from './MonitorStatus';
import MonitorTickets from './MonitorTickets';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    marginTop: '0 !important',
    width: '100%'
  },
  paper: {
    marginTop: theme.spacing()
  },
  status: {
    padding: theme.spacing()
  }
}));

interface StateProps {
  monitors: ManagedServiceMonitor[];
  loading: boolean;
  error?: APIError[];
  updated: number;
}

type CombinedProps = StateProps & DispatchProps;

export const ManagedDashboardCard: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  React.useEffect(() => {
    // Rely on Redux error handling.
    props.requestManagedServices().catch(_ => null);

    const interval = setInterval(
      () => props.requestManagedServices().catch(_ => null),
      10000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  // if (!loading && !error && monitors.length === 0 && updated === 0) {
  //   return null;
  // }

  return (
    <DashboardCard
      title="Managed Services"
      className={classes.root}
      headerAction={() => <Link to="/managed">View Details</Link>}
      data-qa-dash-managed
    >
      <Paper className={classes.paper}>
        <LoadingErrorOrContent {...props} />
      </Paper>
    </DashboardCard>
  );
};

const LoadingErrorOrContent: React.FC<StateProps> = props => {
  const { error, loading, monitors, updated } = props;
  const classes = useStyles();

  /**
   * Don't show error state if we've successfully retrieved
   * monitor data but then a subsequent poll fails
   */
  if (error && updated === 0) {
    const errorString = getAPIErrorOrDefault(
      error,
      'Error loading your Managed service information.'
    )[0].reason;
    return <ErrorState errorText={errorString} compact />;
  }

  if (loading && updated === 0) {
    return <CircleProgress mini />;
  }

  return (
    <Grid
      container
      direction="row"
      wrap="nowrap"
      justify="center"
      alignItems="center"
    >
      <Grid
        container
        item
        direction="column"
        justify="center"
        alignItems="center"
        xs={4}
        className={classes.status}
      >
        <Grid item>
          <MonitorStatus monitors={monitors} />
        </Grid>
        <Grid item>
          <MonitorTickets issues={[]} />
        </Grid>
      </Grid>
      <Grid item xs={8}>
        Placeholder
      </Grid>
    </Grid>
  );
};

const withManaged = ManagedContainer(
  (ownProps, managedLoading, lastUpdated, monitors, managedError) => ({
    ...ownProps,
    loading: managedLoading,
    updated: lastUpdated,
    monitors,
    error: managedError!.read
  })
);

const enhanced = compose<CombinedProps, {}>(withManaged);

export default enhanced(ManagedDashboardCard);

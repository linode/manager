import { ManagedServiceMonitor } from 'linode-js-sdk/lib/managed';
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
import Healthy from './Healthy';
import Unhealthy from './Unhealthy';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    marginTop: '0 !important'
  },
  paper: {
    marginTop: theme.spacing()
  }
}));

interface StateProps {
  monitors: ManagedServiceMonitor[];
  loading: boolean;
  error?: Linode.ApiFieldError[];
  updated: number;
}

type CombinedProps = StateProps & DispatchProps;

export const ManagedDashboardCard: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { error, loading, monitors, updated } = props;

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

  if (!loading && !error && monitors.length === 0 && updated === 0) {
    return null;
  }

  return (
    <DashboardCard
      title="Managed Services"
      className={classes.root}
      headerAction={() => <Link to="/managed">View All</Link>}
      data-qa-dash-volume
    >
      <Paper className={classes.paper}>
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justify="center"
          alignItems="center"
        >
          <Content
            error={error}
            loading={loading}
            monitors={monitors}
            updated={updated}
          />
        </Grid>
      </Paper>
    </DashboardCard>
  );
};

const Content: React.FC<StateProps> = props => {
  const { error, loading, monitors, updated } = props;
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

  const failedMonitors = getFailedMonitors(monitors);
  if (failedMonitors.length > 0) {
    return <Unhealthy monitorsDown={failedMonitors.length} />;
  }

  return <Healthy />;
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

const getFailedMonitors = (monitors: ManagedServiceMonitor[]) => {
  /**
   * This assumes that a status of "failed" is the only
   * error state; but if all a user's monitors are pending
   * or disabled, they'll all pass the test here and the
   * user will get a message saying that all monitors are
   * verified.
   */
  return monitors.reduce((accum, thisMonitor) => {
    if (thisMonitor.status === 'problem') {
      return [...accum, thisMonitor.id];
    } else {
      return accum;
    }
  }, []);
};

const enhanced = compose<CombinedProps, {}>(withManaged);

export default enhanced(ManagedDashboardCard);

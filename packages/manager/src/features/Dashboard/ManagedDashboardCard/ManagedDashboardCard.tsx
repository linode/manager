import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import withManagedIssues, {
  DispatchProps as IssueDispatch,
  ManagedIssuesProps
} from 'src/containers/managedIssues.container';
import withManaged, {
  DispatchProps,
  ManagedProps
} from 'src/containers/managedServices.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import DashboardCard from '../DashboardCard';
import ManagedChartPanel from './ManagedChartPanel';
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
    padding: theme.spacing(),
    borderRight: `solid 1px ${theme.palette.divider}`
  }
}));

type CombinedProps = ManagedProps &
  DispatchProps &
  ManagedIssuesProps &
  IssueDispatch;

export const ManagedDashboardCard: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  React.useEffect(() => {
    // Rely on Redux error handling.
    props.requestManagedServices().catch(_ => null);
    props.requestManagedIssues().catch(_ => null);

    const interval = setInterval(() => {
      props.requestManagedServices().catch(_ => null);
      props.requestManagedIssues().catch(_ => null);
    }, 10000);

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

const LoadingErrorOrContent: React.FC<CombinedProps> = props => {
  const {
    issues,
    managedError,
    managedLoading,
    monitors,
    managedLastUpdated,
    issuesLoading,
    issuesError,
    issuesLastUpdated
  } = props;
  const classes = useStyles();

  /**
   * Don't show error state if we've successfully retrieved
   * monitor data but then a subsequent poll fails
   */
  if (
    (managedError.read && managedLastUpdated === 0) ||
    (issuesError.read && issuesLastUpdated === 0)
  ) {
    const errorString = getAPIErrorOrDefault(
      managedError.read || issuesError.read || [],
      'Error loading your Managed service information.'
    )[0].reason;
    return <ErrorState errorText={errorString} compact />;
  }

  if (
    (managedLoading && managedLastUpdated === 0) ||
    (issuesLoading && issuesLastUpdated === 0)
  ) {
    return <CircleProgress />;
  }

  return (
    <Grid container direction="row" wrap="nowrap" justify="center">
      <Grid
        container
        item
        direction="column"
        justify="space-around"
        alignItems="center"
        xs={5}
        spacing={1}
        className={classes.status}
      >
        <Grid item>
          <MonitorStatus monitors={monitors} />
        </Grid>
        <Grid item>
          <MonitorTickets issues={issues} />
        </Grid>
      </Grid>
      <Grid item xs={7}>
        <ManagedChartPanel data={6} />
      </Grid>
    </Grid>
  );
};

const enhanced = compose<CombinedProps, {}>(
  withManaged(),
  withManagedIssues()
);

export default enhanced(ManagedDashboardCard);

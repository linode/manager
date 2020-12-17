import { getManagedStats, ManagedStatsData } from '@linode/api-v4/lib/managed';
import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
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
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import usePolling from 'src/hooks/usePolling';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import DashboardCard from '../DashboardCard_CMR';
import ManagedChartPanel from './ManagedChartPanel';
import MonitorStatus from './MonitorStatus';
import MonitorTickets from './MonitorTickets';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.cmrBGColors.bgPaper,
    margin: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginBottom: 20
    }
  },
  status: {
    position: 'relative',
    [theme.breakpoints.up('sm')]: {
      margin: `${theme.spacing(3)}px ${theme.spacing(1)}px !important`
    }
  },
  outerContainer: {
    [theme.breakpoints.up('sm')]: {
      flexWrap: 'nowrap'
    }
  },
  detailsLink: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  monitorStatusOuter: {
    marginBottom: theme.spacing(1),
    [theme.breakpoints.up('lg')]: {
      marginBottom: theme.spacing(3) + 2
    }
  }
}));

type CombinedProps = ManagedProps &
  DispatchProps &
  ManagedIssuesProps &
  IssueDispatch;

export const ManagedDashboardCard: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { requestManagedServices, requestManagedIssues } = props;
  const {
    data,
    error,
    loading,
    lastUpdated,
    update
  } = useAPIRequest<ManagedStatsData | null>(
    () => getManagedStats().then(response => response.data),
    null
  );

  usePolling(
    [
      () => requestManagedServices().catch(_ => null),
      () => requestManagedIssues().catch(_ => null),
      update
    ],
    10000
  );

  React.useEffect(() => {
    // @todo rely on interval for initial requests
    // Rely on Redux error handling.
    requestManagedServices().catch(_ => null);
    requestManagedIssues().catch(_ => null);
  }, []);

  const statsError =
    error && data === null
      ? getAPIErrorOrDefault(error, 'Unable to load your usage statistics.')[0]
          .reason
      : undefined;
  const statsLoading = loading && lastUpdated === 0;

  return (
    <DashboardCard
      alignItems="center"
      className={classes.root}
      noHeaderActionStyles
    >
      <LoadingErrorOrContent
        {...props}
        data={data}
        statsError={statsError}
        statsLoading={statsLoading}
      />
    </DashboardCard>
  );
};

interface ContentProps extends CombinedProps {
  data: ManagedStatsData | null;
  statsLoading: boolean;
  statsError?: string;
}

const LoadingErrorOrContent: React.FC<ContentProps> = props => {
  const {
    data,
    issues,
    managedError,
    managedLoading,
    monitors,
    managedLastUpdated,
    issuesLoading,
    issuesError,
    issuesLastUpdated,
    statsError,
    statsLoading
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
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="center"
      className={classes.outerContainer}
    >
      <Grid
        container
        item
        direction="column"
        justify="space-around"
        alignItems="center"
        xs={12}
        sm={5}
        className={classes.status}
      >
        <Grid item className={classes.monitorStatusOuter}>
          <MonitorStatus monitors={monitors} />
        </Grid>
        <Grid item>
          <MonitorTickets issues={issues} />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={8} className="p0">
        <ManagedChartPanel
          data={data}
          loading={statsLoading}
          error={statsError}
        />
      </Grid>
    </Grid>
  );
};

const enhanced = compose<CombinedProps, {}>(withManaged(), withManagedIssues());

export default enhanced(ManagedDashboardCard);

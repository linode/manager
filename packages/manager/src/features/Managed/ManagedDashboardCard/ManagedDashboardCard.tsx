import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import {
  useAllManagedIssuesQuery,
  useAllManagedMonitorsQuery,
} from 'src/queries/managed/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import DashboardCard from './DashboardCard';
import ManagedChartPanel from './ManagedChartPanel';
import MonitorStatus from './MonitorStatus';
import MonitorTickets from './MonitorTickets';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.bgPaper,
    margin: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginBottom: 20,
    },
  },
  status: {
    position: 'relative',
    [theme.breakpoints.up('sm')]: {
      margin: `${theme.spacing(3)} ${theme.spacing(1)} !important`,
    },
  },
  outerContainer: {
    [theme.breakpoints.up('sm')]: {
      flexWrap: 'nowrap',
    },
  },
  detailsLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  monitorStatusOuter: {
    marginBottom: theme.spacing(1),
    [theme.breakpoints.up('lg')]: {
      marginBottom: `calc(${theme.spacing(3)} + 2px)`,
    },
  },
}));

export const ManagedDashboardCard = () => {
  const classes = useStyles();

  const {
    data: monitors,
    isLoading: monitorsLoading,
    error: monitorsError,
  } = useAllManagedMonitorsQuery();

  const {
    data: issues,
    isLoading: issuesLoading,
    error: issuesError,
  } = useAllManagedIssuesQuery();

  const defaultError = 'Error loading your Managed service information.';

  if (monitorsError) {
    const error = getAPIErrorOrDefault(monitorsError, defaultError)[0].reason;

    return <ErrorState errorText={error} compact />;
  }

  if (issuesError) {
    const error = getAPIErrorOrDefault(issuesError, defaultError)[0].reason;

    return <ErrorState errorText={error} compact />;
  }

  if (monitorsLoading || issuesLoading) {
    return <CircleProgress />;
  }

  return (
    <DashboardCard
      alignItems="center"
      className={classes.root}
      noHeaderActionStyles
    >
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        className={classes.outerContainer}
      >
        <Grid
          container
          direction="column"
          justifyContent="space-around"
          alignItems="center"
          xs={12}
          sm={5}
          className={classes.status}
        >
          <Grid className={classes.monitorStatusOuter}>
            <MonitorStatus monitors={monitors || []} />
          </Grid>
          <Grid>
            <MonitorTickets issues={issues || []} />
          </Grid>
        </Grid>
        <Grid xs={12} sm={8} className="p0">
          <ManagedChartPanel />
        </Grid>
      </Grid>
    </DashboardCard>
  );
};

export default ManagedDashboardCard;

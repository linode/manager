import * as React from 'react';
import Grid from 'src/components/Grid';
import DashboardCard from './DashboardCard';
import ManagedChartPanel from './ManagedChartPanel';
import MonitorStatus from './MonitorStatus';
import MonitorTickets from './MonitorTickets';
import { ManagedStatsData } from '@linode/api-v4/lib/managed';
import { makeStyles, Theme } from 'src/components/core/styles';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  useAllManagedIssuesQuery,
  useAllManagedMonitorsQuery,
  useManagedStatsQuery,
} from 'src/queries/managed/managed';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.cmrBGColors.bgPaper,
    margin: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginBottom: 20,
    },
  },
  status: {
    position: 'relative',
    [theme.breakpoints.up('sm')]: {
      margin: `${theme.spacing(3)}px ${theme.spacing(1)}px !important`,
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
      marginBottom: theme.spacing(3) + 2,
    },
  },
}));

export const ManagedDashboardCard = () => {
  const classes = useStyles();
  const { data, isLoading, error } = useManagedStatsQuery();

  // @TODO
  // usePolling(
  //   [
  //     () => requestManagedServices().catch((_) => null),
  //     () => requestManagedIssues().catch((_) => null),
  //     update,
  //   ],
  //   10000
  // );

  const statsError = error
    ? getAPIErrorOrDefault(error, 'Unable to load your usage statistics.')[0]
        .reason
    : undefined;

  return (
    <DashboardCard
      alignItems="center"
      className={classes.root}
      noHeaderActionStyles
    >
      <LoadingErrorOrContent
        data={data?.data}
        statsError={statsError}
        statsLoading={isLoading}
      />
    </DashboardCard>
  );
};

interface ContentProps {
  data: ManagedStatsData | undefined;
  statsLoading: boolean;
  statsError?: string;
}

const LoadingErrorOrContent: React.FC<ContentProps> = (props) => {
  const { data, statsError, statsLoading } = props;
  const classes = useStyles();

  const { data: monitors } = useAllManagedMonitorsQuery();
  const { data: issues } = useAllManagedIssuesQuery();

  return (
    <Grid
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
      className={classes.outerContainer}
    >
      <Grid
        container
        item
        direction="column"
        justifyContent="space-around"
        alignItems="center"
        xs={12}
        sm={5}
        className={classes.status}
      >
        <Grid item className={classes.monitorStatusOuter}>
          <MonitorStatus monitors={monitors || []} />
        </Grid>
        <Grid item>
          <MonitorTickets issues={issues || []} />
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

export default ManagedDashboardCard;

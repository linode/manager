import { ManagedServiceMonitor } from '@linode/api-v4/lib/managed';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { WithTheme, makeStyles, withTheme } from '@mui/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import MonitorFailed from 'src/assets/icons/monitor-failed.svg';
import MonitorOK from 'src/assets/icons/monitor-ok.svg';
import { Typography } from 'src/components/Typography';

export const useStyles = makeStyles((theme: Theme) => ({
  error: {
    '&:before': {
      backgroundColor: theme.color.red,
      content: '""',
      height: 3,
      left: -30,
      position: 'absolute',
      top: 7,
      width: 16,
    },
    '&:last-of-type': {
      marginBottom: 0,
    },
    color: theme.color.headline,
    marginBottom: `calc(${theme.spacing(2)} - 3)`,
    position: 'relative',
    textAlign: 'left',
  },
  icon: {
    '& svg': {
      display: 'flex',
      height: 56,
      width: 56,
    },
  },
  root: {
    padding: `0`,
    textAlign: 'center',
    [theme.breakpoints.down('lg')]: {
      padding: `${theme.spacing(2)} 0 0`,
    },
  },
  text: {
    maxWidth: 250,
  },
}));

export interface Props {
  monitors: ManagedServiceMonitor[];
}

type CombinedProps = Props & WithTheme;

export const MonitorStatus: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { monitors } = props;

  const failedMonitors = getFailedMonitors(monitors);
  const iconSize = 50;

  return (
    <Grid
      alignItems="center"
      className={classes.root}
      container
      direction="column"
      justifyContent="center"
    >
      <Grid>
        <Grid className={classes.icon}>
          {failedMonitors.length === 0 ? (
            <MonitorOK height={iconSize} width={iconSize} />
          ) : (
            <MonitorFailed height={iconSize} width={iconSize} />
          )}
        </Grid>
      </Grid>
      <Grid>
        <Typography variant="h2">
          {failedMonitors.length === 0
            ? 'All monitored services are up'
            : `${failedMonitors.length} monitored ${
                failedMonitors.length === 1 ? 'service is' : 'services are'
              } down`}
        </Typography>
      </Grid>
      {failedMonitors.length > 0 && (
        <Grid>
          {failedMonitors.map((thisMonitor, idx) => (
            <Typography
              className={classes.error}
              key={`failed-monitor-list-${idx}`}
              variant="body1"
            >
              {thisMonitor}
            </Typography>
          ))}
        </Grid>
      )}
      <Grid>
        <Typography className={classes.text}>
          <Link to="/managed/monitors">View your list of service monitors</Link>
          {` `}
          {failedMonitors.length === 0
            ? 'to see details or to update your monitors.'
            : 'for details.'}
        </Typography>
      </Grid>
    </Grid>
  );
};

const getFailedMonitors = (monitors: ManagedServiceMonitor[]): string[] => {
  /**
   * This assumes that a status of "failed" is the only
   * error state; but if all a user's monitors are pending
   * or disabled, they'll all pass the test here and the
   * user will get a message saying that all monitors are
   * verified.
   */
  return monitors.reduce((accum, thisMonitor) => {
    if (thisMonitor.status === 'problem') {
      return [...accum, thisMonitor.label];
    } else {
      return accum;
    }
  }, []);
};

const enhanced = compose<CombinedProps, Props>(withTheme);

export default enhanced(MonitorStatus);

import { ManagedServiceMonitor } from '@linode/api-v4/lib/managed';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import MonitorFailed from 'src/assets/icons/monitor-failed.svg';
import MonitorOK from 'src/assets/icons/monitor-ok.svg';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `0`,
    textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      padding: `${theme.spacing(2)}px 0 0`,
    },
  },
  icon: {
    '& svg': {
      display: 'flex',
      width: 56,
      height: 56,
    },
  },
  error: {
    position: 'relative',
    color: theme.color.headline,
    marginBottom: theme.spacing(2) - 3,
    textAlign: 'left',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 7,
      left: -30,
      backgroundColor: theme.color.red,
      height: 3,
      width: 16,
    },
    '&:last-of-type': {
      marginBottom: 0,
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
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      className={classes.root}
      item
    >
      <Grid item>
        <Grid item className={classes.icon}>
          {failedMonitors.length === 0 ? (
            <MonitorOK width={iconSize} height={iconSize} />
          ) : (
            <MonitorFailed width={iconSize} height={iconSize} />
          )}
        </Grid>
      </Grid>
      <Grid item>
        <Typography variant="h2">
          {failedMonitors.length === 0
            ? 'All monitored services are up'
            : `${failedMonitors.length} monitored ${
                failedMonitors.length === 1 ? 'service is' : 'services are'
              } down`}
        </Typography>
      </Grid>
      {failedMonitors.length > 0 && (
        <Grid item>
          {failedMonitors.map((thisMonitor, idx) => (
            <Typography
              key={`failed-monitor-list-${idx}`}
              className={classes.error}
              variant="body1"
            >
              {thisMonitor}
            </Typography>
          ))}
        </Grid>
      )}
      <Grid item>
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

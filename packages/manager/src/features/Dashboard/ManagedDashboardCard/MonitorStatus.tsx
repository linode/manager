import { ManagedServiceMonitor } from 'linode-js-sdk/lib/managed';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import MonitorFailed from 'src/assets/icons/monitor-failed.svg';
import MonitorOK from 'src/assets/icons/monitor-ok.svg';

import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

import { COMPACT_SPACING_UNIT } from 'src/themeFactory';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `${theme.spacing(2)}px ${theme.spacing(2)}px 0`,
    textAlign: 'center'
  },
  icon: {
    '& svg': {
      display: 'flex'
    }
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
      width: 16
    },
    '&:last-of-type': {
      marginBottom: 0
    }
  }
}));

export interface Props {
  monitors: ManagedServiceMonitor[];
}

type CombinedProps = Props & WithTheme;

export const MonitorStatus: React.FC<CombinedProps> = props => {
  const { monitors } = props;
  const classes = useStyles();

  const iconSize = props.theme.spacing(1) === COMPACT_SPACING_UNIT ? 75 : 50;

  const failedMonitors = getFailedMonitors(monitors);

  return (
    <>
      <Grid
        container
        direction="column"
        alignItems="center"
        justify="center"
        className={classes.root}
        item
      >
        <Grid item>
          <Grid
            item
            style={
              props.theme.spacing(1) === COMPACT_SPACING_UNIT
                ? { padding: '0 3px' }
                : undefined
            }
            className={classes.icon}
          >
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
          <Typography>
            <Link to="/managed/monitors">
              View your list of service monitors
            </Link>
            {` `}
            {failedMonitors.length === 0
              ? 'to see details or to update your monitors.'
              : 'for details.'}
          </Typography>
        </Grid>
      </Grid>
    </>
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

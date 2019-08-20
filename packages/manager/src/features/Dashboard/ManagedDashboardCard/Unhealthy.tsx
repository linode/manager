import * as React from 'react';
import { Link } from 'react-router-dom';

import MonitorFailed from 'src/assets/icons/monitor-failed.svg';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

import { useStyles } from './Healthy';

interface Props {
  monitorsDown: number;
}

export const Unhealthy: React.FC<Props> = props => {
  const classes = useStyles();
  const { monitorsDown } = props;
  return (
    <>
      <Grid item xs={1} className={classes.icon}>
        <MonitorFailed height={45} width={45} />
      </Grid>
      <Grid container item direction="column" justify="space-around">
        <Grid item className={classes.text}>
          <Typography variant="subtitle1">
            {/** This does not quite match the designs, but we don't have a way of checking failure time yet. */}
            <strong>
              {monitorsDown} of your Managed Service Monitors{' '}
              {monitorsDown === 1 ? 'has' : 'have'} failed.
            </strong>
          </Typography>
        </Grid>
        <Grid item className={classes.text}>
          <Typography>
            Please check your
            <Link to="/support/tickets"> Support tickets</Link> for details.
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default Unhealthy;

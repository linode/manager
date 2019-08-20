import * as React from 'react';
import { Link } from 'react-router-dom';

import MonitorOK from 'src/assets/icons/monitor-ok.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

export const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    margin: theme.spacing(2)
  },
  text: {
    paddingBottom: '2px !important',
    paddingTop: '2px !important'
  }
}));

export const Healthy: React.FC<{}> = _ => {
  const classes = useStyles();
  return (
    <>
      <Grid item xs={1} className={classes.icon}>
        <MonitorOK height={45} width={45} />
      </Grid>
      <Grid container item direction="column" justify="space-around">
        <Grid item className={classes.text}>
          <Typography variant="subtitle1">
            <strong>All Managed Service Monitors are verified.</strong>
          </Typography>
        </Grid>
        <Grid item className={classes.text}>
          <Typography>
            <Link to="/managed/monitors">View your Managed Services</Link> for
            details.
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default Healthy;

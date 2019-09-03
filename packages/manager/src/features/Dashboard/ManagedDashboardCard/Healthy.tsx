import * as React from 'react';
import { Link } from 'react-router-dom';

import MonitorOK from 'src/assets/icons/monitor-ok.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    maxWidth: '100%'
  },
  container: {
    flex: 1
  },
  icon: {
    width: 40,
    height: 40
  },
  header: {
    marginBottom: 2
  }
}));

export const Healthy: React.FC<{}> = _ => {
  const classes = useStyles();
  return (
    <>
      <Grid
        container
        direction="row"
        alignItems="center"
        className={classes.root}
      >
        <Grid item>
          <Grid item className={classes.icon}>
            <MonitorOK width={40} height={40} />
          </Grid>
        </Grid>
        <Grid item className={classes.container}>
          <Typography variant="h3" className={classes.header}>
            All Managed Service Monitors are verified.
          </Typography>
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

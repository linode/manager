import * as React from 'react';
import { Link } from 'react-router-dom';

import MonitorOK from 'src/assets/icons/monitor-ok.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `${theme.spacing(3) - 4}px`,
    maxWidth: '100%'
  },
  container: {
    flex: 1
  },
  icon: {
    width: 48,
    height: 48
  },
  header: {
    marginBottom: 11
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
        spacing={0}
      >
        <Grid item>
          <Grid item xs={12} className={classes.icon}>
            <MonitorOK width={48} height={48} />
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

import * as React from 'react';
import { Link } from 'react-router-dom';
import MonitorOK from 'src/assets/icons/monitor-ok.svg';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

import DashboardCard from '../DashboardCard';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    marginTop: '0 !important'
  },
  icon: {
    margin: theme.spacing(2)
  },
  paper: {
    marginTop: theme.spacing()
  },
  text: {
    paddingBottom: '2px !important',
    paddingTop: '2px !important'
  }
}));

export const ManagedDashboardCard: React.FC<{}> = props => {
  const classes = useStyles();
  return (
    <DashboardCard
      title="Managed Services"
      className={classes.root}
      headerAction={() => <Link to="/managed">View All</Link>}
      data-qa-dash-volume
    >
      <Paper className={classes.paper}>
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justify="center"
          alignItems="center"
        >
          <Grid item xs={1} className={classes.icon}>
            <MonitorOK height={45} width={45} />
          </Grid>
          <Grid container item direction="column" justify="space-around">
            <Grid item className={classes.text}>
              <Typography variant="subtitle1">
                <strong>All Managed service monitors are verified.</strong>
              </Typography>
            </Grid>
            <Grid item className={classes.text}>
              <Typography>
                <Link to="/managed/monitors">View your Managed services</Link>{' '}
                for details.
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </DashboardCard>
  );
};

export default ManagedDashboardCard;

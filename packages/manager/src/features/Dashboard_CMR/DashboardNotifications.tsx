import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';

import {
  AccountActivity,
  Alerts,
  Community,
  LinodeNews,
  Maintenance,
  OpenSupportTickets,
  PendingActions
} from 'src/features/NotificationCenter';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '1280px',
    padding: theme.spacing(2)
  }
}));

export const Notifications: React.FC<{}> = _ => {
  const classes = useStyles();
  return (
    <Paper className={classes.root}>
      <Grid container direction="row">
        <Grid item xs={6}>
          <Grid container direction="column">
            <Grid item>
              <PendingActions />
            </Grid>
            <Grid item>
              <OpenSupportTickets />
            </Grid>
            <Grid item>
              <Alerts />
            </Grid>
            <Grid item>
              <Maintenance />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Grid container direction="column">
            <Grid item>
              <Community />
            </Grid>
            <Grid item>
              <AccountActivity />
            </Grid>
            <Grid item>
              <LinodeNews />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(Notifications);

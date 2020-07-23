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
  PastDue,
  PendingActions
} from 'src/features/NotificationCenter';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
    borderRadius: 3
  },
  column: {
    width: '45%'
  }
}));

export const Notifications: React.FC<{}> = _ => {
  const classes = useStyles();
  return (
    <Paper className={classes.root}>
      <PastDue />
      <Grid container direction="row" justify="space-between">
        <Grid item className={classes.column}>
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
        <Grid item className={classes.column}>
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

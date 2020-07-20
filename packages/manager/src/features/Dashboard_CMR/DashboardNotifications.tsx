import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import Grid from 'src/components/Grid';

import { OpenSupportTickets } from 'src/features/NotificationCenter';

const useStyles = makeStyles(() => ({
  root: {
    width: '1280px',
    height: '350px'
  }
}));

export const Notifications: React.FC<{}> = _ => {
  const classes = useStyles();
  return (
    <Grid container className={classes.root}>
      <Grid item xs={6}>
        <OpenSupportTickets />
      </Grid>
    </Grid>
  );
};

export default React.memo(Notifications);

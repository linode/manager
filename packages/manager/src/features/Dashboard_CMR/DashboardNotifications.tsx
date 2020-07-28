import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import useAccount from 'src/hooks/useAccount';
import { getLogins } from '@linode/api-v4/lib/profile';
import { getEvents, Event } from '@linode/api-v4/lib/account';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';

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
    borderRadius: 3,
    marginBottom: 30
  },
  column: {
    width: '45%'
  }
}));

export const Notifications: React.FC<{}> = _ => {
  const classes = useStyles();
  const { account } = useAccount();
  const balance = account.data?.balance ?? 0;

  const [events, setEvents] = React.useState<Event[]>([]);
  const [eventsError, setEventsError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  /**
   * 1. Figure out most recent login for this user
   * 2. Request events since that time
   * 3. Pass the ones we want to the Community component below
   */

  React.useEffect(() => {
    getLogins({}, { '+order_by': 'datetime', '+order': 'desc' })
      .then(response => {
        const mostRecentLogin = response.data[0]?.datetime;

        getEvents(
          {},
          {
            created: {
              '+gt': mostRecentLogin
            }
          }
        )
          .then(response => {
            setEvents(response.data);
            setLoading(false);
          })
          .catch(error => {
            setEventsError(error[0].reason);
            setLoading(false);
          });
      })
      .catch(error => {
        setEventsError(error[0].reason);
        setLoading(false);
      });
  });

  const communityEvents = events.filter(event =>
    [
      'community_like',
      'community_question_reply',
      'community_mention'
    ].includes(event.action)
  );

  return loading ? (
    <CircleProgress />
  ) : eventsError ? (
    <ErrorState errorText={eventsError} />
  ) : (
    <Paper className={classes.root}>
      {balance > 0 && <PastDue balance={balance} />}
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
              <Community communityEvents={communityEvents} />
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

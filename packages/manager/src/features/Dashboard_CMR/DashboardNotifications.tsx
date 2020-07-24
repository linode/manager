import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import useAccount from 'src/hooks/useAccount';
import { getLogins } from '@linode/api-v4/lib/profile';
import { getEvents, Event } from '@linode/api-v4/lib/account';
import CircleProgress from 'src/components/CircleProgress';

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
  const { account } = useAccount();
  const balance = account.data?.balance ?? 0;

  /**
   * 1. Figure out most recent login for this user
   * 2. Request events since that time
   * 3. Pass the ones we want to the Community component below
   * (community_like, community_question_reply)
   */

  const [events, setEvents] = React.useState<Event[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    getLogins({}, { '+order_by': 'datetime', '+order': 'desc' })
      .then(response => {
        const mostRecentLogin = response[0]?.datetime; // maybe 2nd to last, experiment and see.

        getEvents(
          // may have to use getAll method
          {},
          {
            created: {
              '+gt': mostRecentLogin
            }
          }
        ).then(response => {
          // setEvents(response.data); // temporarily commented out here and set below for development purposes
          setEvents([
            {
              id: 99724720,
              created: '2020-07-23T21:42:02',
              seen: false,
              read: false,
              percent_complete: null,
              time_remaining: null,
              rate: null,
              duration: null,
              action: 'community_like',
              username: 'jskobos',
              entity: {
                id: 17566,
                type: 'community_like',
                label:
                  '1 user liked your answer to: How do I deploy an image to an existing Linode?',
                url: 'https://linode.com/community/questions/17566#answer-67728'
              },
              status: 'notification',
              secondary_entity: null
            }
          ]);

          setLoading(false);
        });
      })
      .catch(error => {
        setError(error[0].reason);
      });
  }, []);

  const communityEvents = events.filter(event =>
    ['community_like', 'community_question_reply'].includes(event.action)
  );

  return loading ? (
    <CircleProgress />
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

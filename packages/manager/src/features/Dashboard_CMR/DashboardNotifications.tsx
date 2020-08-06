import { getInvoices } from '@linode/api-v4/lib/account';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { notificationContext } from 'src/features/NotificationCenter/NotificationContext';
import useAccount from 'src/hooks/useAccount';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import BillingSummary from 'src/features/Billing/BillingPanels/BillingSummary';

import {
  Alerts,
  Community,
  Maintenance,
  OpenSupportTickets,
  PendingActions
} from 'src/features/NotificationCenter';
import Hidden from 'src/components/core/Hidden';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: 30,
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(3),
      borderRadius: 3
    }
  },
  column: {
    [theme.breakpoints.up('md')]: {
      width: '45%'
    }
  }
}));

export const Notifications: React.FC<{}> = _ => {
  const classes = useStyles();
  const { account } = useAccount();
  const balance = account.data?.balance ?? 0;
  const balanceUninvoiced = account.data?.balance_uninvoiced ?? 0;

  const context = React.useContext(notificationContext);
  const mostRecentInvoiceRequest = useAPIRequest<number | undefined>(
    () =>
      getInvoices({}, { '+order': 'desc', '+order_by': 'date' }).then(
        response => response.data[0].id
      ),
    undefined
  );

  const communityEvents = context.events.filter(event =>
    [
      'community_like',
      'community_question_reply',
      'community_mention'
    ].includes(event.action)
  );

  return context.loading ? (
    <CircleProgress />
  ) : context.error ? (
    <ErrorState errorText={context.error} />
  ) : (
    <>
      <BillingSummary
        balance={balance}
        balanceUninvoiced={balanceUninvoiced}
        mostRecentInvoiceId={mostRecentInvoiceRequest.data}
      />
      <Paper className={classes.root}>
        <Grid container direction="row" justify="space-between">
          <Hidden smDown>
            <Grid item className={classes.column}>
              <Grid container direction="column">
                <Grid item>
                  <PendingActions />
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
                  <OpenSupportTickets />
                </Grid>
                <Grid item>
                  <Community communityEvents={communityEvents} />
                </Grid>
              </Grid>
            </Grid>
          </Hidden>

          {/* Small screen version */}
          <Hidden mdUp>
            <PendingActions />
            <Alerts />
            <Maintenance />
            <OpenSupportTickets />
            <Community communityEvents={communityEvents} />
          </Hidden>
        </Grid>
      </Paper>
    </>
  );
};

export default React.memo(Notifications);

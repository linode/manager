import { getInvoices } from '@linode/api-v4/lib/account';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import BillingSummary from 'src/features/Billing/BillingPanels/BillingSummary';
import {
  Community,
  Maintenance,
  OpenSupportTickets,
  PendingActions
} from 'src/features/NotificationCenter';
import useNotificationData from 'src/features/NotificationCenter/NotificationData/useNotificationData';
import useAccount from 'src/hooks/useAccount';
import useAccountManagement from 'src/hooks/useAccountManagement';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import ManagedDashboardCard from '../Dashboard/ManagedDashboardCard/ManagedDashboardCard_CMR';
import EmailBounceNotification from './EmailBounceNotification';
import LinodeNews from './LinodeNews';
import useNotifications from 'src/hooks/useNotifications';
import useProfile from 'src/hooks/useProfile';
import { useHistory } from 'react-router-dom';

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

  const [
    dismissedAccountEmailNotice,
    setDismissedAccountEmailNotice
  ] = React.useState(false);

  const [
    dismissedUserEmailNotice,
    setDismissedUserEmailNotice
  ] = React.useState(false);

  const [accountSubmitting, setAccountSubmitting] = React.useState(false);
  const [profileSubmitting, setProfileSubmitting] = React.useState(false);

  const { _isManagedAccount, account, profile } = useAccountManagement();
  const { updateAccount } = useAccount();
  const { updateProfile } = useProfile();

  const history = useHistory();

  const balance = account.data?.balance ?? 0;
  const balanceUninvoiced = account.data?.balance_uninvoiced ?? 0;

  const {
    community,
    pendingActions,
    statusNotifications,
    support
  } = useNotificationData();

  const notifications = useNotifications();

  const billingEmailBounceNotification = notifications.find(
    thisNotification => thisNotification.type === 'billing_email_bounce'
  );

  const userEmailBounceNotification = notifications.find(
    thisNotification => thisNotification.type === 'user_email_bounce'
  );

  const mostRecentInvoiceRequest = useAPIRequest<number | undefined>(
    () =>
      getInvoices({}, { '+order': 'desc', '+order_by': 'date' }).then(
        response => response.data[0].id
      ),
    undefined
  );

  return (
    <>
      {!dismissedAccountEmailNotice &&
        billingEmailBounceNotification &&
        account?.data?.email && (
          <EmailBounceNotification
            email={account.data.email}
            onConfirm={() => {
              setAccountSubmitting(true);
              updateAccount({ email: account?.data?.email ?? '' })
                .then(() => {
                  setDismissedAccountEmailNotice(true);
                })
                .catch(() => {
                  // @todo: what to do here?
                });
            }}
            onRequestChange={() => history.push('/account')} // We also need a way to re-request notifications
            loading={accountSubmitting}
          />
        )}
      {!dismissedUserEmailNotice &&
        userEmailBounceNotification &&
        profile?.data?.email && (
          <EmailBounceNotification
            email={profile.data.email}
            onConfirm={() => {
              setProfileSubmitting(true);
              updateProfile({ email: profile?.data?.email })
                .then(() => {
                  setDismissedUserEmailNotice(true);
                })
                .catch(_ => {
                  // @todo: what here?
                });
            }}
            onRequestChange={() => history.push('/profile')} // We also need a way to re-request notifications
            loading={profileSubmitting}
          />
        )}
      <Hidden smDown>
        <BillingSummary
          balance={balance}
          balanceUninvoiced={balanceUninvoiced}
          mostRecentInvoiceId={mostRecentInvoiceRequest.data}
        />
      </Hidden>
      {_isManagedAccount && <ManagedDashboardCard />}
      <Paper className={classes.root}>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="flex-start"
        >
          <Hidden smDown>
            <Grid item className={classes.column}>
              <Grid container direction="column">
                <Grid item>
                  <PendingActions pendingActions={pendingActions} />
                </Grid>
                <Grid item>
                  <Maintenance statusNotifications={statusNotifications} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item className={classes.column}>
              <Grid container direction="column">
                <Grid item>
                  <OpenSupportTickets
                    loading={support.loading}
                    error={Boolean(support.error)}
                    openTickets={support.data}
                  />
                </Grid>
                <Grid item>
                  <Community
                    loading={community.loading}
                    communityEvents={community.events}
                    error={Boolean(community.error)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Hidden>

          {/* Small screen version */}
          <Hidden mdUp>
            <PendingActions pendingActions={pendingActions} />
            <Maintenance statusNotifications={statusNotifications} />
            <OpenSupportTickets
              loading={support.loading}
              error={Boolean(support.error)}
              openTickets={support.data}
            />
            <Community
              loading={community.loading}
              communityEvents={community.events}
              error={Boolean(community.error)}
            />
          </Hidden>
        </Grid>
      </Paper>

      <Hidden mdUp>
        <BillingSummary
          balance={balance}
          balanceUninvoiced={balanceUninvoiced}
          mostRecentInvoiceId={mostRecentInvoiceRequest.data}
        />
      </Hidden>

      <LinodeNews />
    </>
  );
};

export default React.memo(Notifications);

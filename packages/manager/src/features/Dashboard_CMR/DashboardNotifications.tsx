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
import LinodeNews from './LinodeNews';
import ManagedDashboardCard from '../Dashboard/ManagedDashboardCard/ManagedDashboardCard_CMR';
import AbuseTicketBanner from 'src/components/AbuseTicketBanner/AbuseTicketBanner';

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

  const {
    community,
    pendingActions,
    statusNotifications,
    support
  } = useNotificationData();
  const { _isManagedAccount, _hasAccountAccess } = useAccountManagement();

  const mostRecentInvoiceRequest = useAPIRequest<number | undefined>(
    () =>
      getInvoices({}, { '+order': 'desc', '+order_by': 'date' }).then(
        response => response.data[0].id
      ),
    undefined
  );

  return (
    <>
      <AbuseTicketBanner />
      {_hasAccountAccess && (
        <Hidden smDown>
          <BillingSummary
            balance={balance}
            balanceUninvoiced={balanceUninvoiced}
            mostRecentInvoiceId={mostRecentInvoiceRequest.data}
          />
        </Hidden>
      )}
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

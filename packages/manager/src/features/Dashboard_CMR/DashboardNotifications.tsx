import { getInvoices } from '@linode/api-v4/lib/account';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
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
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { MapState } from 'src/store/types';
import LinodeNews from './LinodeNews';
import ManagedDashboardCard from '../Dashboard/ManagedDashboardCard/ManagedDashboardCard_CMR';

interface StateProps {
  managed: boolean;
}

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

export type CombinedProps = StateProps;

export const Notifications: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { account } = useAccount();
  const balance = account.data?.balance ?? 0;
  const balanceUninvoiced = account.data?.balance_uninvoiced ?? 0;

  const { managed } = props;
  const { community, pendingActions, support } = useNotificationData();

  const mostRecentInvoiceRequest = useAPIRequest<number | undefined>(
    () =>
      getInvoices({}, { '+order': 'desc', '+order_by': 'date' }).then(
        response => response.data[0].id
      ),
    undefined
  );

  return (
    <>
      <Hidden smDown>
        <BillingSummary
          balance={balance}
          balanceUninvoiced={balanceUninvoiced}
          mostRecentInvoiceId={mostRecentInvoiceRequest.data}
        />
      </Hidden>
      {managed && <ManagedDashboardCard />}
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
                  <Maintenance />
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
            <Maintenance />
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

const mapStateToProps: MapState<StateProps, {}> = state => {
  return {
    managed: pathOr(
      false,
      ['__resources', 'accountSettings', 'data', 'managed'],
      state
    )
  };
};

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, {}>(connected)(Notifications);

export default enhanced;

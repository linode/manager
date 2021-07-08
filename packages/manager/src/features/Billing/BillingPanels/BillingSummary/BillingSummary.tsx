import {
  ActivePromotion,
  PromotionServiceType,
} from '@linode/api-v4/lib/account/types';
import { PaymentMethod } from '@linode/api-v4';
import { GridSize } from '@material-ui/core/Grid';
import { Breakpoint } from '@material-ui/core/styles/createBreakpoints';
import * as classnames from 'classnames';
import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import HelpIcon from 'src/components/HelpIcon';
import PaymentDrawer from './PaymentDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: 0,
    marginBottom: 16,
    minHeight: 97,
  },
  paper: {
    padding: `15px 20px`,
    height: '100%',
  },
  helpIcon: {
    padding: `0px 8px`,
    color: '#888f91',
    '& svg': {
      height: 20,
      width: 20,
    },
  },
  noBalance: {
    color: theme.palette.text.primary,
  },
  positiveBalance: {
    color: theme.cmrIconColors.iRed,
  },
  credit: {
    color: theme.color.green,
  },
  makeAPaymentButton: {
    ...theme.applyLinkStyles,
  },
  text: {
    color: theme.palette.text.primary,
  },
  accruedCharges: {
    color: theme.palette.text.primary,
  },
}));

const serviceTypeMap: Partial<Record<PromotionServiceType, string>> = {
  all: 'All',
  backup: 'Backups',
  blockstorage: 'Volumes',
  db_mysql: 'DBaaS',
  ip_v4: 'IPv4',
  linode: 'Linodes',
  linode_disk: 'Storage',
  linode_memory: 'Memory',
  longview: 'Longview',
  managed: 'Managed',
  nodebalancer: 'NodeBalancers',
  objectstorage: 'Object Storage',
  transfer_tx: 'Transfer Overages',
};

// =============================================================================
// <BillingSummary />
// =============================================================================
interface BillingSummaryProps {
  promotions?: ActivePromotion[];
  paymentMethods: PaymentMethod[] | undefined;
  balanceUninvoiced: number;
  balance: number;
}

export const BillingSummary: React.FC<BillingSummaryProps> = (props) => {
  const classes = useStyles();

  const { promotions, paymentMethods, balanceUninvoiced, balance } = props;

  //
  // Payment Drawer
  //

  // On-the-fly route matching so this component can open the drawer itself.
  const makePaymentRouteMatch = Boolean(
    useRouteMatch('/account/billing/make-payment')
  );

  const { replace } = useHistory();

  const [paymentDrawerOpen, setPaymentDrawerOpen] = React.useState<boolean>(
    false
  );

  const openPaymentDrawer = React.useCallback(
    () => setPaymentDrawerOpen(true),
    []
  );

  const closePaymentDrawer = React.useCallback(() => {
    setPaymentDrawerOpen(false);
    replace('/account/billing');
  }, [replace]);

  React.useEffect(() => {
    if (makePaymentRouteMatch) {
      openPaymentDrawer();
    }
  }, [makePaymentRouteMatch, openPaymentDrawer]);

  //
  // Account Balance logic
  //
  let accountBalanceText = 'You have no balance at this time.';
  // @todo: In the future make this account for grace period, etc.
  if (balance > 0) {
    accountBalanceText = 'Payment Due';
  }
  if (balance < 0) {
    accountBalanceText = 'Credit';
  }

  const accountBalanceClassnames = classnames({
    [classes.noBalance]: balance === 0,
    [classes.positiveBalance]: balance > 0,
    [classes.credit]: balance < 0,
  });

  // The layout changes if there are promotions.
  const gridDimensions: Partial<Record<Breakpoint, GridSize>> =
    promotions && promotions.length > 0 ? { xs: 12, md: 4 } : { xs: 12, sm: 6 };

  return (
    <>
      <Grid container spacing={2} className={classes.root}>
        <Grid item {...gridDimensions} sm={6}>
          <Paper className={classes.paper} variant="outlined">
            <Typography variant="h3">Account Balance</Typography>
            <Divider />
            <Box
              marginTop="12px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant={balance === 0 ? 'body1' : 'h3'}
                style={{ marginRight: 8 }}
                className={accountBalanceClassnames}
                data-testid="account-balance-text"
              >
                {accountBalanceText}
              </Typography>
              <Typography variant="h3" className={accountBalanceClassnames}>
                <Currency
                  quantity={Math.abs(balance)}
                  dataAttrs={{ 'data-testid': 'account-balance-value' }}
                />
              </Typography>
            </Box>
            {balance > 0 ? (
              <Typography style={{ marginTop: 16 }}>
                <button
                  className={classes.makeAPaymentButton}
                  onClick={() => replace('/account/billing/make-payment')}
                >
                  Make a payment immediately
                </button>{' '}
                to avoid service disruption.
              </Typography>
            ) : null}
          </Paper>
        </Grid>
        {promotions && promotions?.length > 0 ? (
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.paper} variant="outlined">
              <Typography variant="h3">Promotions</Typography>

              <Divider />
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {promotions?.map((thisPromo) => (
                  <PromoDisplay key={thisPromo.summary} {...thisPromo} />
                ))}
              </div>
            </Paper>
          </Grid>
        ) : null}
        <Grid item {...gridDimensions}>
          <Paper className={classes.paper} variant="outlined">
            <Box display="flex" alignItems="center">
              <Typography variant="h3">Accrued Charges</Typography>
              <HelpIcon
                className={classes.helpIcon}
                text="Our billing cycle ends on the last day of the month. You may be invoiced before the end of the cycle if your balance exceeds your credit limit."
              />
            </Box>
            <Divider />
            <Box
              marginTop="12px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography>Since last invoice</Typography>
              <Typography variant="h3" className={classes.accruedCharges}>
                <Currency
                  quantity={balanceUninvoiced}
                  dataAttrs={{ 'data-testid': 'accrued-charges-value' }}
                />
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <PaymentDrawer
        paymentMethods={paymentMethods}
        open={paymentDrawerOpen}
        onClose={closePaymentDrawer}
      />
    </>
  );
};

export default React.memo(BillingSummary);

// =============================================================================
// PromoDisplay
// =============================================================================
export type PromoDisplayProps = ActivePromotion;

export const PromoDisplay: React.FC<PromoDisplayProps> = React.memo((props) => {
  const classes = useStyles();

  const {
    summary,
    description,
    credit_remaining,
    expire_dt,
    credit_monthly_cap,
    service_type,
  } = props;

  const parsedCreditRemaining = Number.parseFloat(credit_remaining);
  const parsedCreditMonthlyCap = Number.parseFloat(credit_monthly_cap);

  return (
    <Box marginTop="12px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
      >
        <Box display="flex" alignItems="center">
          <Typography
            variant="h3"
            className={classes.text}
            style={{ wordBreak: 'break-word' }}
          >
            {summary}
          </Typography>
          <HelpIcon className={classes.helpIcon} text={description} />
        </Box>
        {!Number.isNaN(parsedCreditRemaining) ? (
          <Typography
            variant="h3"
            className={classes.credit}
            style={{ marginBottom: '4px' }}
          >
            <Currency quantity={parsedCreditRemaining} /> remaining
          </Typography>
        ) : null}
      </Box>
      {expire_dt ? (
        <Typography>
          Expires: <DateTimeDisplay value={expire_dt} displayTime={false} />
        </Typography>
      ) : null}
      {service_type !== 'all' && serviceTypeMap[service_type] ? (
        <Typography>Applies to: {serviceTypeMap[service_type]}</Typography>
      ) : null}
      {parsedCreditMonthlyCap > 0 ? (
        <Typography>
          Monthly cap: <Currency quantity={parsedCreditMonthlyCap} />
        </Typography>
      ) : null}
    </Box>
  );
});

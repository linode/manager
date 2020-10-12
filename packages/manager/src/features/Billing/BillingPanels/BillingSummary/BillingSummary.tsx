import { ActivePromotion } from '@linode/api-v4/lib/account/types';
import * as React from 'react';
import CreditCard from 'src/assets/icons/credit-card.svg';
import Info from 'src/assets/icons/info.svg';
import InvoiceIcon from 'src/assets/icons/invoice.svg';
import Grid from 'src/components/core/Grid';
import IconButton from 'src/components/core/IconButton';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import IconTextLink from 'src/components/IconTextLink';
import { getNextCycleEstimatedBalance } from './billingUtilities';
import PaymentDrawer from './PaymentDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: 20,
    padding: theme.spacing(3) + 1,
    border: `solid 1px ${theme.cmrBorderColors.borderBillingSummary}`,
    borderRadius: 8,
    backgroundColor: theme.cmrBGColors.bgBillingSummary
  },
  header: {
    marginBottom: theme.spacing(2) - 1
  },
  unpaidBalance: {
    marginBottom: theme.spacing(1) + 2,
    fontSize: 32,
    color: '#cf1e1e'
  },
  gridItem: {
    padding: `0 0 ${theme.spacing(3) + 1}px`,
    [theme.breakpoints.up('md')]: {
      padding: `0 ${theme.spacing(4) - 2}px`
    },
    '&:first-of-type': {
      [theme.breakpoints.up('md')]: {
        paddingLeft: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }
    },
    '&:nth-of-type(2)': {
      [theme.breakpoints.up('md')]: {
        borderLeft: `1px solid ${theme.cmrBorderColors.borderBillingSummary}`
      }
    },
    '&:last-of-type': {
      paddingBottom: 0,
      [theme.breakpoints.up('md')]: {
        paddingRight: 0
      }
    }
  },
  balanceOuter: {
    paddingTop: theme.spacing(1) - 3,
    borderTop: `1px dashed ${theme.cmrBorderColors.borderBalance}`
  },
  label: {
    margin: `${theme.spacing(1) - 3}px 0`,
    fontWeight: 'bold',
    color: theme.color.headline,
    fontSize: '1rem',
    letterSpacing: 0.07,
    lineHeight: 1.25
  },
  field: {
    margin: `${theme.spacing(1) - 3}px 0`,
    color: `${theme.color.headline}`,
    fontSize: '1rem',
    lineHeight: 1.13
  },
  caption: {
    marginTop: theme.spacing(1) + 2,
    textAlign: 'right'
  },
  text: {
    lineHeight: 1.43,
    letterSpacing: 0.1,
    color: theme.color.billingText
  },
  iconButtonOuter: {
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.between('sm', 'md')]: {
      flexDirection: 'column'
    }
  },
  iconButton: {
    paddingLeft: 0,
    [theme.breakpoints.up('md')]: {
      paddingBottom: 0
    },
    '&:hover': {
      '& svg': {
        color: `${theme.palette.primary.main} !important`
      }
    }
  },
  infoIcon: {
    padding: `0px ${theme.spacing(1) + 2}px`,
    top: -2
  }
}));

interface Props {
  promotion?: ActivePromotion;
  balanceUninvoiced: number;
  balance: number;
  mostRecentInvoiceId?: number;
}

export const BillingSummary: React.FC<Props> = props => {
  const { promotion, balanceUninvoiced, balance, mostRecentInvoiceId } = props;

  const [paymentDrawerOpen, setPaymentDrawerOpen] = React.useState<boolean>(
    false
  );

  const openPaymentDrawer = React.useCallback(
    () => setPaymentDrawerOpen(true),
    []
  );

  const closePaymentDrawer = React.useCallback(
    () => setPaymentDrawerOpen(false),
    []
  );

  const classes = useStyles();

  const promoThisMonthCreditRemaining = promotion?.this_month_credit_remaining
    ? Number(promotion?.this_month_credit_remaining)
    : undefined;

  const nextCycleEstimatedBalance = getNextCycleEstimatedBalance({
    balance,
    balanceUninvoiced,
    promoThisMonthCreditRemaining
  });

  const shouldDisplayPromotion =
    Boolean(promotion) && promoThisMonthCreditRemaining !== undefined;

  const determinePaymentDisplay = (pastDueAmount: number) => {
    if (pastDueAmount > 0) {
      return (
        <div>
          <Typography className={classes.header} variant="h2">
            Past Due Amount
          </Typography>
          <Typography className={classes.unpaidBalance} component="h2">
            <Currency quantity={pastDueAmount} />
          </Typography>
          <Typography className={classes.text}>
            Please make a payment immediately to avoid service disruption.
          </Typography>
        </div>
      );
    } else {
      return (
        <div>
          <Typography className={classes.header} variant="h2">
            No Payment Due
          </Typography>
          <Typography className={classes.text}>
            Your account is paid in full and no payment is due at this time.
          </Typography>
        </div>
      );
    }
  };
  return (
    <>
      <Paper className={classes.root}>
        <Grid container alignItems="stretch">
          <Grid item xs={12} md={4} className={classes.gridItem}>
            {/* If balance is > 0, it is considered past due. */}
            {determinePaymentDisplay(balance)}

            <div className={classes.iconButtonOuter}>
              <IconTextLink
                SideIcon={CreditCard}
                text="Make a payment"
                title="Make a payment"
                onClick={openPaymentDrawer}
                className={classes.iconButton}
              />

              <IconTextLink
                SideIcon={InvoiceIcon}
                text="View last invoice"
                title="View last invoice"
                to={`/account/billing/invoices/${mostRecentInvoiceId}`}
                className={classes.iconButton}
                disabled={!mostRecentInvoiceId}
              />
            </div>
          </Grid>
          <Grid item xs={12} md={4} className={classes.gridItem}>
            <Typography className={classes.header} variant="h2">
              Next Billing Cycle
            </Typography>
            <Typography className={classes.text}>
              Your balance reflects charges accrued since your last invoice,
              minus any promotions or credits applied to your account.
            </Typography>
            {/*
          Commenting out as adding promo code is not possible yet

          <div className={classes.iconButtonOuter}>
            <IconTextLink
              SideIcon={GiftBox}
              text="Enter a promo code"
              title="Enter a promo code"
              onClick={openPromoDrawer}
              className={classes.iconButton}
            />
          </div>
          */}
          </Grid>
          <Grid item xs={12} md={4} className={classes.gridItem}>
            <Grid item container justify="space-between">
              <Grid item>
                <Typography className={classes.label}>
                  Uninvoiced Charges*
                </Typography>
              </Grid>
              <Grid item>
                <Typography className={classes.field}>
                  <Currency quantity={balanceUninvoiced} />
                </Typography>
              </Grid>
            </Grid>
            {/*

            */}
            {shouldDisplayPromotion && (
              <Grid item container justify="space-between" alignItems="center">
                <Grid item xs={8}>
                  <Typography className={classes.label}>
                    Promotion {promotion!.summary}
                    <Tooltip
                      title={promotion!.description}
                      enterTouchDelay={0}
                      leaveTouchDelay={5000}
                      placement={'bottom'}
                    >
                      <IconButton className={classes.infoIcon}>
                        <Info />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography className={classes.field}>
                    -
                    <Currency
                      quantity={promoThisMonthCreditRemaining!}
                      wrapInParentheses
                    />
                  </Typography>
                </Grid>
              </Grid>
            )}

            <Grid item container justify="space-between">
              <Grid item>
                <Typography className={classes.label}>
                  Payment &amp; Credits
                </Typography>
              </Grid>
              <Grid item>
                <Typography className={classes.field}>
                  {/* Only display balance if less than 0, otherwise display 0. Balance, if a positive integer, is instead applied as past due. */}
                  {balance < 0 ? (
                    <Currency quantity={balance} wrapInParentheses />
                  ) : (
                    <Currency quantity={0} />
                  )}
                </Typography>
              </Grid>
            </Grid>
            <Grid
              item
              container
              className={classes.balanceOuter}
              justify="space-between"
            >
              <Grid item>
                <Typography className={classes.label}>
                  Next Cycle Estimated Balance*
                </Typography>
              </Grid>
              <Grid item>
                <Typography className={classes.field}>
                  {/* If there is credit left over post-calculation, display as negative in parens */}
                  <Currency
                    quantity={nextCycleEstimatedBalance}
                    wrapInParentheses={nextCycleEstimatedBalance < 0}
                  />
                </Typography>
              </Grid>
            </Grid>
            <Typography className={classes.caption}>
              * Based on estimated usage
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <PaymentDrawer open={paymentDrawerOpen} onClose={closePaymentDrawer} />
    </>
  );
};

export default React.memo(BillingSummary);

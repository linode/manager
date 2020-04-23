import * as React from 'react';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import CreditCard from 'src/assets/icons/credit-card.svg';
import Invoice from 'src/assets/icons/invoice.svg';
// import GiftBox from 'src/assets/icons/gift-box.svg';
import IconTextLink from 'src/components/IconTextLink';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3) + 1,
    border: `solid 1px #cce2ff`,
    borderRadius: 8,
    backgroundColor: '#f5f9ff'
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
    '&:last-of-type': {
      paddingBottom: 0
    },
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
        borderLeft: '1px solid #cce2ff'
      }
    },
    '&:last-of-type': {
      [theme.breakpoints.up('md')]: {
        paddingRight: 0
      }
    }
  },
  balanceOuter: {
    paddingTop: theme.spacing(1) - 3,
    borderTop: '1px dashed #cce2ff'
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
    color: theme.color.headline,
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
    color: '#313335'
  },
  iconButtonOuter: {
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.only('md')]: {
      flexDirection: 'column'
    }
  },
  iconButton: {
    paddingLeft: 0,
    [theme.breakpoints.up('md')]: {
      paddingBottom: 0
    }
  }
}));

interface Props {
  pastDueAmount?: number;
  hasPromotion?: boolean;
  openPaymentDrawer: () => void;
  goToInvoice: () => void;
}

export const BillingSummary: React.FC<Props> = props => {
  const { hasPromotion, openPaymentDrawer, goToInvoice, pastDueAmount } = props;

  const classes = useStyles();

  const determinePaymentDisplay = (_pastDueAmount: number) => {
    if (_pastDueAmount > 0) {
      return (
        <div>
          <Typography className={classes.header} variant="h2">
            Past Due Amount
          </Typography>
          <Typography className={classes.unpaidBalance} component="h2">
            ${_pastDueAmount.toFixed(2)}
          </Typography>
          <Typography className={classes.text}>
            Your payment was due on $DATE. Please make a payment immediately to
            avoid service disruption.
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
    <Paper className={classes.root}>
      <Grid container alignItems="stretch">
        <Grid item xs={12} md={4} className={classes.gridItem}>
          {determinePaymentDisplay(pastDueAmount)}

          <div className={classes.iconButtonOuter}>
            <IconTextLink
              SideIcon={CreditCard}
              text="Make a payment"
              title="Make a payment"
              onClick={openPaymentDrawer}
              className={classes.iconButton}
            />
            <IconTextLink
              SideIcon={Invoice}
              text="View invoice"
              title="View invoice"
              onClick={goToInvoice}
              className={classes.iconButton}
            />
          </div>
        </Grid>
        <Grid item xs={12} md={4} className={classes.gridItem}>
          <Typography className={classes.header} variant="h2">
            Next Billing Cycle
          </Typography>
          <Typography className={classes.text}>
            Your balance reflects charges accrued since your last invoice, minus
            any promotions or credits applied to your account.
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
              <Typography className={classes.field}>$100.00</Typography>
            </Grid>
          </Grid>
          {hasPromotion && (
            <Grid item container justify="space-between">
              <Grid item>
                <Typography className={classes.label}>Promotion</Typography>
              </Grid>
              <Grid item>
                <Typography className={classes.field}>-($25.00)</Typography>
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
              <Typography className={classes.field}>$0.00</Typography>
            </Grid>
          </Grid>
          <Grid
            item
            container
            className={classes.balanceOuter}
            justify="space-between"
          >
            <Grid item>
              <Typography className={classes.label}>Balance</Typography>
            </Grid>
            <Grid item>
              <Typography className={classes.field}>$150.00</Typography>
            </Grid>
          </Grid>
          <Typography className={classes.caption}>
            * Based on estimated usage
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BillingSummary;

import * as React from 'react';
import CreditCard from 'src/assets/icons/credit-card.svg';
import InvoiceIcon from 'src/assets/icons/invoice.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import IconTextLink from 'src/components/IconTextLink';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.lightBlue,
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2)
  },
  iconButton: {
    paddingLeft: 0,
    paddingRight: theme.spacing(5),
    paddingBottom: 0,
    '&:hover': {
      '& svg': {
        color: `${theme.palette.primary.main} !important`
      }
    }
  },
  headline: {
    color: theme.color.red,
    lineHeight: '32px',
    fontSize: '24px',
    marginBottom: theme.spacing()
  },
  actions: {
    marginTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  }
}));

interface Props {}

export const PastDue: React.FC<Props> = _ => {
  const mostRecentInvoiceId = 5;
  const openPaymentDrawer = () => null;
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography className={classes.headline}>$50.00 Past Due</Typography>
      <Typography>
        Your payment was due on 01-July-2020. Please make a payment immediately
        to avoid disruption.
      </Typography>
      <div className={classes.actions}>
        <IconTextLink
          SideIcon={CreditCard}
          text="Make a payment"
          title="Make a payment"
          onClick={openPaymentDrawer}
          className={classes.iconButton}
        />

        <IconTextLink
          SideIcon={InvoiceIcon}
          text="View most recent invoice"
          title="View most recent invoice"
          to={`/account/billing/invoices/${mostRecentInvoiceId}`}
          className={classes.iconButton}
          disabled={!mostRecentInvoiceId}
        />
      </div>
    </div>
  );
};

export default PastDue;

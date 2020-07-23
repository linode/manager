import { getInvoices, Invoice } from '@linode/api-v4/lib/account';
import * as React from 'react';
import CreditCard from 'src/assets/icons/credit-card.svg';
import InvoiceIcon from 'src/assets/icons/invoice.svg';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import IconTextLink from 'src/components/IconTextLink';
import { formatDate } from 'src/utilities/formatDate';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3) + 1,
    border: `solid 1px ${theme.color.borderBilling}`,
    borderRadius: 8,
    backgroundColor: theme.bg.billingHeader,
    height: 160
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

interface Props {
  balance: number;
}

export const PastDue: React.FC<Props> = props => {
  const { balance } = props;
  const [invoiceLoading, setInvoiceLoading] = React.useState(false);
  const [mostRecentInvoice, setMostRecentInvoice] = React.useState<Invoice>();
  const openPaymentDrawer = () => null;
  const classes = useStyles();

  React.useEffect(() => {
    setInvoiceLoading(true);
    getInvoices({}, { '+order': 'desc', '+order_by': 'date' })
      .then(response => {
        setMostRecentInvoice(response.data?.[0]);
        setInvoiceLoading(false);
      })
      .catch(_ => setInvoiceLoading(false)); // Just leave the invoice as undefined
  }, []);

  if (invoiceLoading) {
    return (
      <div
        className={classes.root}
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <CircleProgress mini />
      </div>
    );
  }
  return (
    <div className={classes.root}>
      <Typography className={classes.headline}>
        <Currency quantity={balance} /> Past Due
      </Typography>
      <Typography>
        {mostRecentInvoice && (
          <>
            Your payment was due on{' '}
            {formatDate(mostRecentInvoice.date, { format: 'dd-LLL-yyyy' })}
            {`. `}
          </>
        )}
        Please make a payment immediately to avoid service disruption.
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
          to={`/account/billing/invoices/${mostRecentInvoice?.id}`}
          className={classes.iconButton}
          disabled={!mostRecentInvoice?.id}
        />
      </div>
    </div>
  );
};

export default PastDue;

import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import Chip from 'src/components/core/Chip';
import ActionMenu, {
  Action,
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import Typography from 'src/components/core/Typography';
import CreditCard from 'src/features/Billing/BillingPanels/PaymentInfoPanel/CreditCard';
import GooglePay from 'src/assets/icons/payment/googlePay.svg';
import PayPal from 'src/assets/icons/payment/payPal.svg';
import { CardProvider } from 'src/features/Billing/BillingPanels/PaymentInfoPanel/CreditCard';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(),
    padding: 0,
  },
  actions: {
    marginLeft: 'auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    display: 'flex',
    justifyContent: 'center',
    width: 45,
  },
  paymentMethodText: {
    fontWeight: 'bold',
  },
  payPal: {
    border: `1px solid ${theme.color.grey2}`,
    padding: '5px 8px',
  },
  chip: {
    fontSize: '0.625rem',
  },
}));

// @TODO: Separate payment method from (googlepay, paypal) from card type
interface Props {
  lastFour?: string;
  expiry?: string;
  isDefault: boolean;
  paymentMethod: string;
}

type CombinedProps = Props;

const PaymentMethodRow: React.FC<CombinedProps> = (props) => {
  const { expiry, lastFour, isDefault, paymentMethod } = props;
  const classes = useStyles();

  const paymentIcon = (provider: string): any => {
    switch (provider) {
      case 'GooglePay':
        return <GooglePay />;
      case 'PayPal':
        return <PayPal className={classes.payPal} />;
    }
  };

  const paymentInfo =
    paymentMethod && ['GooglePay', 'PayPal'].includes(paymentMethod) ? (
      <>
        <span className={classes.icon}>{paymentIcon(paymentMethod)}</span>
        <Typography className={classes.paymentMethodText}>
          &nbsp;{paymentMethod === 'GooglePay' ? 'Google Pay' : paymentMethod}
        </Typography>
      </>
    ) : (
      <CreditCard
        provider={paymentMethod}
        expiry={expiry}
        lastFour={lastFour}
      />
    );

  const actions: Action[] = [
    {
      title: 'Make a Payment',
      onClick: () => {
        ('');
      },
    },
    {
      title: 'Make Default',
      disabled: isDefault,
      onClick: () => {
        ('');
      },
    },
    {
      title: 'Edit',
      onClick: () => {
        ('');
      },
    },
    {
      title: 'Remove',
      onClick: () => {
        ('');
      },
    },
  ];

  return (
    <Paper className={classes.root} variant="outlined">
      <Grid container>
        <Grid item className={classes.item}>
          {paymentInfo}
        </Grid>
        <Grid item className={classes.item}>
          {isDefault && (
            <Chip className={classes.chip} label="DEFAULT" component="span" />
          )}
        </Grid>
        <Grid item className={classes.actions}>
          <ActionMenu
            actionsList={actions}
            ariaLabel={`Action menu for ${
              lastFour ? `card ending in ${lastFour}` : paymentMethod
            }`}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PaymentMethodRow;

import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import isCreditCardExpired from 'src/utilities/isCreditCardExpired';
import Chip from 'src/components/core/Chip';
import ActionMenu, {
  Action,
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import Typography from 'src/components/core/Typography';
import Visa from 'src/assets/icons/payment/visa.svg';
import Mastercard from 'src/assets/icons/payment/mastercard.svg';
import GooglePay from 'src/assets/icons/payment/googlePay.svg';
import PayPal from 'src/assets/icons/payment/payPal.svg';
import Amex from 'src/assets/icons/payment/amex.svg';
import Discover from 'src/assets/icons/payment/discover.svg';
import JCB from 'src/assets/icons/payment/jcb.svg';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(),
  },
  expiry: {
    marginLeft: theme.spacing(),
    [theme.breakpoints.down('xs')]: {
      marginLeft: '0',
    },
  },
  expired: {
    color: theme.color.red,
  },
  actions: {
    marginLeft: 'auto',
  },
  card: {
    display: 'flex',
    [theme.breakpoints.down('xs')]: {
      display: 'grid',
    },
  },
  item: {
    display: 'flex',
    alignItems: 'center',
  },
  paymentText: {
    fontWeight: 'bold',
  },
  visa: {
    padding: '0 6px',
    marginLeft: '3px',
    marginRight: '1px',
  },
  mastercard: {
    paddingLeft: '5px',
    marginRight: '2px',
  },
  discover: {
    marginLeft: '3px',
  },
  googlePay: {
    marginRight: '4px',
  },
  payPal: {
    border: `1px solid ${theme.color.grey2}`,
    padding: '5px 8px',
    marginLeft: '6px',
    marginRight: '12px',
  },
  chip: {
    fontSize: '0.625rem',
  },
}));

interface Props {
  lastFour?: string;
  expiry?: string;
  isDefault?: boolean;
  paymentMethod?: string;
}

type CombinedProps = Props;

const PaymentMethodRow: React.FC<CombinedProps> = (props) => {
  const { expiry, lastFour, isDefault, paymentMethod } = props;
  const classes = useStyles();
  const isCardExpired = expiry && isCreditCardExpired(expiry);

  const paymentIcon = (): any => {
    switch (paymentMethod) {
      case 'Visa':
        return <Visa className={classes.visa} />;
      case 'Mastercard':
        return <Mastercard className={classes.mastercard} />;
      case 'Amex':
        return <Amex />;
      case 'Discover':
        return <Discover className={classes.discover} />;
      case 'GooglePay':
        return <GooglePay className={classes.googlePay} />;
      case 'PayPal':
        return <PayPal className={classes.payPal} />;
      case 'JCB':
        return <JCB />;
    }
  };

  const paymentText =
    paymentMethod && ['GooglePay', 'PayPal'].includes(paymentMethod) ? (
      <Grid item>
        <Typography className={classes.paymentText}>
          {paymentMethod === 'GooglePay' ? 'Google Pay' : paymentMethod}
        </Typography>
      </Grid>
    ) : (
      <Grid item className={classes.card}>
        <Typography className={classes.paymentText}>
          &nbsp;{paymentMethod} ****{lastFour}
        </Typography>
        <Typography className={classes.expiry}>
          {isCardExpired ? (
            <span className={classes.expired}>&nbsp;{`Expired ${expiry}`}</span>
          ) : (
            <span>&nbsp;{`Expires ${expiry}`}</span>
          )}
        </Typography>
      </Grid>
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
    <Paper className={classes.root} border>
      <Grid container>
        <Grid item className={classes.item}>
          {paymentIcon()}
          {paymentText}
        </Grid>
        <Grid item className={classes.item}>
          {isDefault && (
            <Chip className={classes.chip} label="DEFAULT" component="span" />
          )}
        </Grid>
        <Grid item className={classes.actions}>
          <ActionMenu
            actionsList={actions}
            ariaLabel={`Action menu for card ending in ${lastFour}`}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PaymentMethodRow;

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
import CreditCard from 'src/assets/icons/credit-card.svg';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(),
  },
  expiry: {
    marginLeft: theme.spacing(),
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0,
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
  icon: {
    display: 'flex',
    justifyContent: 'center',
    width: 45,
  },
  paymentText: {
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
  const isCardExpired = expiry && isCreditCardExpired(expiry);

  const paymentIcon = (): any => {
    switch (paymentMethod) {
      case 'Visa':
        return <Visa />;
      case 'Mastercard':
        return <Mastercard />;
      case 'Amex':
        return <Amex />;
      case 'Discover':
        return <Discover />;
      case 'GooglePay':
        return <GooglePay />;
      case 'PayPal':
        return <PayPal className={classes.payPal} />;
      case 'JCB':
        return <JCB />;
      default:
        return <CreditCard />;
    }
  };

  const paymentText =
    paymentMethod && ['GooglePay', 'PayPal'].includes(paymentMethod) ? (
      <Grid item>
        <Typography className={classes.paymentText}>
          &nbsp;{paymentMethod === 'GooglePay' ? 'Google Pay' : paymentMethod}
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
          <span className={classes.icon}>{paymentIcon()}</span>
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

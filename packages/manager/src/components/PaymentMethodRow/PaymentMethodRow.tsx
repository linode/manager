import * as React from 'react';
import * as classNames from 'classnames';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import Chip from 'src/components/core/Chip';
import ActionMenu, {
  Action,
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import CreditCard from 'src/features/Billing/BillingPanels/PaymentInfoPanel/CreditCard';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import PayPalIcon from 'src/assets/icons/payment/payPal.svg';
import {
  ThirdPartyPayment,
  CreditCard as CreditCardType,
} from '@linode/api-v4/lib/account/types';

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

interface Props {
  creditCard?: CreditCardType;
  thirdPartyPayment?: ThirdPartyPayment;
  isDefault: boolean;
}

type CombinedProps = Props;

const iconMap = {
  GooglePay: GooglePayIcon,
  PayPal: PayPalIcon,
};

const getIcon = (paymentMethod: ThirdPartyPayment) => {
  return iconMap[paymentMethod];
};

const PaymentMethodRow: React.FC<CombinedProps> = (props) => {
  const { creditCard, thirdPartyPayment, isDefault } = props;
  const classes = useStyles();

  const paymentInfo =
    thirdPartyPayment && ['GooglePay', 'PayPal'].includes(thirdPartyPayment) ? (
      <>
        <span
          className={classNames({
            [classes.icon]: true,
            [classes.payPal]: thirdPartyPayment === 'PayPal',
          })}
        >
          {getIcon(thirdPartyPayment)}
        </span>
        <Typography className={classes.paymentMethodText}>
          &nbsp;{thirdPartyPayment === 'GooglePay' ? 'Google Pay' : thirdPartyPayment}
        </Typography>
      </>
    ) : (
      creditCard && (
        <CreditCard
          type={creditCard.card_type}
          lastFour={creditCard.last_four}
          expiry={creditCard.expiry}
        />
      )
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
              creditCard?.last_four
                ? `card ending in ${creditCard.last_four}`
                : thirdPartyPayment
            }`}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PaymentMethodRow;

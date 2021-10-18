import {
  CreditCard as CreditCardType,
  ThirdPartyPayment as ThirdPartyPaymentType,
} from '@linode/api-v4/lib/account/types';
import classNames from 'classnames';
import * as React from 'react';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import PayPalIcon from 'src/assets/icons/payment/payPal.svg';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import CreditCard from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    display: 'flex',
    // Safari's default setting for `alignItems` is `stretch` so defining it as
    // `center` fixes the issue
    // https://stackoverflow.com/questions/57516373/image-stretching-in-flexbox-in-safari
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 6,
    paddingRight: 6,
    width: 45,
  },
  paymentTextContainer: {
    display: 'flex',
  },
  paymentMethodLabel: {
    fontFamily: theme.font.bold,
    marginRight: theme.spacing(),
  },
  payPal: {
    border: `1px solid ${theme.color.grey2}`,
    background: 'white',
    padding: '4px 7px',
  },
}));

export const thirdPartyPaymentMap = {
  google_pay: {
    icon: GooglePayIcon,
    label: 'Google Pay',
  },
  paypal: {
    icon: PayPalIcon,
    label: 'PayPal',
  },
};

interface Props {
  thirdPartyPayment: ThirdPartyPaymentType;
  creditCard: CreditCardType;
}

export const getIcon = (paymentMethod: ThirdPartyPaymentType) => {
  return thirdPartyPaymentMap[paymentMethod].icon;
};

export type CombinedProps = Props;

export const TPP: React.FC<CombinedProps> = (props) => {
  const { thirdPartyPayment, creditCard } = props;

  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const Icon = getIcon(thirdPartyPayment);

  return (
    <>
      <Grid item className={classes.icon}>
        <Icon
          className={classNames({
            [classes.payPal]: thirdPartyPayment === 'paypal',
          })}
        />
      </Grid>
      <Grid item className={classes.paymentTextContainer}>
        {!matchesSmDown ? (
          <Typography className={classes.paymentMethodLabel}>
            {thirdPartyPaymentMap[thirdPartyPayment].label}
          </Typography>
        ) : null}
        <CreditCard creditCard={creditCard} showIcon={false} />
      </Grid>
    </>
  );
};

export default TPP;

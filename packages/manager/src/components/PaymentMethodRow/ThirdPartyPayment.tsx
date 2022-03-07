import { PaymentMethod, ThirdPartyPayment } from '@linode/api-v4/lib/account';
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
  paymentMethod: PaymentMethod;
}

export const renderThirdPartyPaymentBody = (paymentMethod: PaymentMethod) => {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (paymentMethod.type) {
    case 'paypal':
      return (
        <Typography>
          <span style={{ wordBreak: 'break-all' }}>
            {paymentMethod.data.email}
          </span>
        </Typography>
      );
    default:
      return <CreditCard creditCard={paymentMethod.data} showIcon={false} />;
  }
};

export const getIcon = (paymentMethod: ThirdPartyPayment) => {
  return thirdPartyPaymentMap[paymentMethod].icon;
};

export const TPP: React.FC<Props> = (props) => {
  const { paymentMethod } = props;

  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const Icon = getIcon(paymentMethod.type as ThirdPartyPayment);

  return (
    <>
      <Grid item className={classes.icon}>
        <Icon />
      </Grid>
      <Grid item className={classes.paymentTextContainer}>
        {!matchesSmDown ? (
          <Typography className={classes.paymentMethodLabel}>
            {thirdPartyPaymentMap[paymentMethod.type].label}
          </Typography>
        ) : null}
        {renderThirdPartyPaymentBody(paymentMethod)}
      </Grid>
    </>
  );
};

export default TPP;

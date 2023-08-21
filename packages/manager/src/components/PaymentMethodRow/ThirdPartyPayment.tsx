import { PaymentMethod, ThirdPartyPayment } from '@linode/api-v4/lib/account';
import { Box } from 'src/components/Box';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { makeStyles, useTheme } from '@mui/styles';
import * as React from 'react';

import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import PayPalIcon from 'src/assets/icons/payment/payPal.svg';
import { Typography } from 'src/components/Typography';
import CreditCard from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    // https://stackoverflow.com/questions/57516373/image-stretching-in-flexbox-in-safari
    alignItems: 'center',
    // Safari's default setting for `alignItems` is `stretch` so defining it as
    // `center` fixes the issue
    display: 'flex',
    justifyContent: 'center',
    paddingLeft: 6,
    paddingRight: 6,
    width: 45,
  },
  paymentMethodLabel: {
    fontFamily: theme.font.bold,
    marginRight: theme.spacing(),
  },
  paymentTextContainer: {
    display: 'flex',
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
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const Icon = getIcon(paymentMethod.type as ThirdPartyPayment);

  return (
    <>
      <Box className={classes.icon}>
        <Icon />
      </Box>
      <Box className={classes.paymentTextContainer}>
        {!matchesSmDown ? (
          <Typography className={classes.paymentMethodLabel}>
            {thirdPartyPaymentMap[paymentMethod.type].label}
          </Typography>
        ) : null}
        {renderThirdPartyPaymentBody(paymentMethod)}
      </Box>
    </>
  );
};

export default TPP;

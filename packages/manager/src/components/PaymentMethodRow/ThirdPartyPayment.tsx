import { Box, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import PayPalIcon from 'src/assets/icons/payment/payPal.svg';
import CreditCard from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';

import { MaskableText } from '../MaskableText/MaskableText';

import type {
  ThirdPartyPayment as _ThirdPartyPayment,
  PaymentMethod,
} from '@linode/api-v4/lib/account';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
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
    font: theme.font.bold,
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

export const ThirdPartyPaymentBody = (props: Props) => {
  const { paymentMethod } = props;

  // eslint-disable-next-line sonarjs/no-small-switch
  switch (paymentMethod.type) {
    case 'paypal':
      return (
        <MaskableText isToggleable text={paymentMethod.data.email}>
          <Typography>
            <span style={{ wordBreak: 'break-all' }}>
              {paymentMethod.data.email}
            </span>
          </Typography>
        </MaskableText>
      );
    default:
      return <CreditCard creditCard={paymentMethod.data} showIcon={false} />;
  }
};

export const getIcon = (paymentMethod: _ThirdPartyPayment) => {
  return thirdPartyPaymentMap[paymentMethod].icon;
};

export const ThirdPartyPayment = (props: Props) => {
  const { paymentMethod } = props;

  const { classes } = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const Icon = getIcon(paymentMethod.type as _ThirdPartyPayment);

  return (
    <>
      <Box className={classes.icon}>
        <Icon />
      </Box>
      <Box className={classes.paymentTextContainer}>
        {!matchesSmDown && (
          <Typography className={classes.paymentMethodLabel}>
            {
              thirdPartyPaymentMap[paymentMethod.type as _ThirdPartyPayment]
                .label
            }
          </Typography>
        )}
        <ThirdPartyPaymentBody paymentMethod={paymentMethod} />
      </Box>
    </>
  );
};

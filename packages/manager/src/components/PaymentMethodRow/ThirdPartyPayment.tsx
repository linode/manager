import * as React from 'react';
import * as classNames from 'classnames';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import PayPalIcon from 'src/assets/icons/payment/payPal.svg';
import { ThirdPartyPayment as ThirdPartyPaymentType } from '@linode/api-v4/lib/account/types';

const useStyles = makeStyles((theme: Theme) => ({
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
    background: 'white',
    padding: '4px 7px',
  },
}));

const thirdPartyPaymentMap = {
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
}

const getIcon = (paymentMethod: ThirdPartyPaymentType) => {
  return thirdPartyPaymentMap[paymentMethod].icon;
};

export type CombinedProps = Props;

export const TPP: React.FC<CombinedProps> = (props) => {
  const { thirdPartyPayment } = props;

  const classes = useStyles();

  const Icon = thirdPartyPayment && getIcon(thirdPartyPayment);

  return (
    <>
      <span className={classes.icon}>
        <Icon
          className={classNames({
            [classes.payPal]: thirdPartyPayment === 'paypal',
          })}
        />
      </span>
      <Typography className={classes.paymentText}>
        &nbsp;{thirdPartyPaymentMap[thirdPartyPayment].label}
      </Typography>
    </>
  );
};

export default TPP;

import * as React from 'react';
import * as classNames from 'classnames';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import PayPalIcon from 'src/assets/icons/payment/payPal.svg';
import {
  CreditCard as CreditCardType,
  ThirdPartyPayment as ThirdPartyPaymentType,
} from '@linode/api-v4/lib/account/types';
import CreditCard from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    display: 'flex',
    justifyContent: 'center',
    width: 45,
  },
  paymentTextContainer: {
    display: 'flex',
  },
  paymentMethodLabel: {
    fontWeight: 'bold',
    marginRight: 8,
    marginLeft: 3,
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

const getIcon = (paymentMethod: ThirdPartyPaymentType) => {
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
      <span className={classes.icon}>
        <Icon
          className={classNames({
            [classes.payPal]: thirdPartyPayment === 'paypal',
          })}
        />
      </span>
      <div className={classes.paymentTextContainer}>
        {!matchesSmDown ? (
          <Typography className={classes.paymentMethodLabel}>
            {thirdPartyPaymentMap[thirdPartyPayment].label}
          </Typography>
        ) : null}
        <CreditCard creditCard={creditCard} showIcon={false} />
      </div>
    </>
  );
};

export default TPP;

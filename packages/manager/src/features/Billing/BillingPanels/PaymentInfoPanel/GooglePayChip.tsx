import * as React from 'react';
import { VariantType } from 'notistack';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import { useScript } from 'src/hooks/useScript';
import { useClientToken } from 'src/queries/accountPayment';
import { makeStyles } from 'src/components/core/styles';
import {
  initGooglePaymentInstance,
  gPay,
} from 'src/features/Billing/Providers/GooglePay';
import Notice from 'src/components/Notice';
import CircleProgress from 'src/components/CircleProgress';

const useStyles = makeStyles(() => ({
  button: {
    border: 0,
    padding: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.7,
    },
  },
  disabled: {
    opacity: 0.3,
    '&:hover': {
      opacity: 0.3,
    },
  },
}));

interface Props {
  makeToast: (message: string, variant: VariantType) => void;
  onClose: () => void;
}

export const GooglePayChip: React.FC<Props> = (props) => {
  const { makeToast, onClose } = props;
  const classes = useStyles();
  const status = useScript('https://pay.google.com/gp/p/js/pay.js');
  const { data, isLoading, error: clientTokenError } = useClientToken();
  const [initializationError, setInitializationError] = React.useState<boolean>(
    false
  );

  React.useEffect(() => {
    const init = async () => {
      if (status === 'ready' && data) {
        try {
          await initGooglePaymentInstance(data.client_token as string);
        } catch (error) {
          // maybe log to Sentry or something
          setInitializationError(true);
        }
      }
    };
    init();
  }, [status, data]);

  const handleMessage = (message: string, variant: VariantType) => {
    makeToast(message, variant);
    if (variant === 'success') {
      onClose();
    }
  };

  const handlePay = () => {
    gPay(
      'add-recurring-payment',
      {
        totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
        currencyCode: 'USD',
        countryCode: 'US',
      },
      handleMessage
    );
  };

  if (status === 'error' || clientTokenError) {
    return <Notice error text="Error loading Google Pay." />;
  }

  if (initializationError) {
    return <Notice error text="Error initializing Google Pay." />;
  }

  if (isLoading) {
    return <CircleProgress mini />;
  }

  return (
    <button className={classes.button} onClick={handlePay}>
      <GooglePayIcon height="48px" />
    </button>
  );
};

export default GooglePayChip;

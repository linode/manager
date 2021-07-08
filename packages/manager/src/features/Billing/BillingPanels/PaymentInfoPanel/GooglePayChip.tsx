import * as React from 'react';
import { VariantType } from 'notistack';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import { useScript } from 'src/hooks/useScript';
import { useClientToken } from 'src/queries/accountPayment';
import { makeStyles, Theme } from 'src/components/core/styles';
import {
  initGooglePaymentInstance,
  gPay,
} from 'src/features/Billing/Providers/GooglePay';
import CircleProgress from 'src/components/CircleProgress';
import HelpIcon from 'src/components/HelpIcon';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    border: 0,
    padding: 0,
    marginTop: 10,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.7,
    },
  },
  disabled: {
    cursor: 'default',
    opacity: 0.3,
    '&:hover': {
      opacity: 0.3,
    },
  },
  errorIcon: {
    color: theme.color.red,
    '&:hover': {
      color: theme.color.red,
      opacity: 0.7,
    },
  },
}));

interface Props {
  makeToast: (message: string, variant: VariantType) => void;
  setProcessing: (processing: boolean) => void;
  onClose: () => void;
  disabled?: boolean;
}

export const GooglePayChip: React.FC<Props> = (props) => {
  const { makeToast, setProcessing, onClose, disabled = false } = props;
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
      handleMessage,
      setProcessing
    );
  };

  if (status === 'error' || clientTokenError || initializationError) {
    return (
      <HelpIcon
        className={classes.errorIcon}
        isError={true}
        size={35}
        text={`Error ${
          initializationError ? 'initializing' : 'loading'
        } Google Pay.`}
      />
    );
  }

  if (isLoading) {
    return <CircleProgress mini />;
  }

  return (
    <button
      className={classNames({
        [classes.button]: true,
        [classes.disabled]: disabled,
      })}
      onClick={handlePay}
      disabled={disabled}
    >
      <GooglePayIcon height="48px" />
    </button>
  );
};

export default GooglePayChip;

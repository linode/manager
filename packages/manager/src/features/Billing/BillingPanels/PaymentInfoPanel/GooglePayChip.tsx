import * as React from 'react';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import { useScript } from 'src/hooks/useScript';
import { useClientToken } from 'src/queries/accountPayment';
import { makeStyles } from 'src/components/core/styles';
import {
  initGooglePaymentInstance,
  gPay,
} from 'src/features/Billing/Providers/GooglePay';
import { useSnackbar, VariantType } from 'notistack';
import classNames from 'classnames';

const useStyles = makeStyles(() => ({
  button: {
    border: 0,
    backgroundColor: 'transparent',
    padding: 0,
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
  onAdd: () => void;
}

export const GooglePayChip: React.FC<Props> = (props) => {
  const { onAdd } = props;
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const status = useScript('https://pay.google.com/gp/p/js/pay.js');
  const { data } = useClientToken();
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const init = async () => {
      if (status === 'ready' && data) {
        try {
          await initGooglePaymentInstance(data.client_token as string);
        } catch (error) {
          // maybe log to Sentry or something
          enqueueSnackbar('Unable to initialize Google Pay.', {
            variant: 'error',
          });
        }
        setLoading(false);
      }
    };
    init();
  }, [status, data]);

  const doToast = (message: string, variant: VariantType) =>
    enqueueSnackbar(message, {
      variant,
    });

  const handlePay = () => {
    gPay(
      'add-recurring-payment',
      {
        totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
        currencyCode: 'USD',
        countryCode: 'US',
      },
      doToast,
      onAdd
    );
  };

  return (
    <button
      className={classNames({
        [classes.button]: true,
        [classes.disabled]: loading,
      })}
      disabled={loading}
      onClick={handlePay}
    >
      <GooglePayIcon height="48px" />
    </button>
  );
};

export default GooglePayChip;

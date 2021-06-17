import * as React from 'react';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import { ScriptStatus, useScript } from 'src/hooks/useScript';
import { makeStyles } from 'src/components/core/styles';
import {
  initGooglePaymentInstance,
  makePayment,
} from 'src/features/Billing/Providers/GooglePay';
import { useSnackbar, VariantType } from 'notistack';

const useStyles = makeStyles(() => ({
  button: {
    border: 0,
    backgroundColor: 'transparent',
    padding: 0,
  },
}));

const GooglePay: React.FC<{}> = () => {
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const status = useScript('https://pay.google.com/gp/p/js/pay.js');

  React.useEffect(() => {
    if (status === ScriptStatus.READY) {
      initGooglePaymentInstance(process.env.REACT_APP_BT_TOKEN || '');
    }
  }, [status]);

  const doToast = (message: string, variant: VariantType) =>
    enqueueSnackbar(message, {
      variant,
    });

  const handlePay = () => {
    makePayment(
      {
        totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
        currencyCode: 'USD',
        countryCode: 'US',
      },
      doToast
    );
  };

  return (
    <button className={classes.button} onClick={handlePay}>
      <GooglePayIcon />
    </button>
  );
};

export default GooglePay;

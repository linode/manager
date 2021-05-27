import * as React from 'react';
import { useEffect } from 'react';
import { useLazyScript } from 'src/hooks/useScript';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import { ScriptStatus } from 'src/hooks/useScript';
import { makeStyles } from 'src/components/core/styles';
import { makePayment } from 'src/features/Billing/Providers/GooglePay';
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
  const { status, load } = useLazyScript(
    'https://pay.google.com/gp/p/js/pay.js'
  );

  const doToast = (message: string, variant: VariantType) =>
    enqueueSnackbar(message, {
      variant,
    });

  const handlePay = () => {
    makePayment(
      process.env.REACT_APP_BT_TOKEN || '',
      {
        totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
        currencyCode: 'USD',
        countryCode: 'US',
      },
      doToast
    );
  };

  useEffect(() => {
    if (status == ScriptStatus.READY) {
      handlePay();
    }
  }, [status]);

  return (
    <button
      className={classes.button}
      onClick={status == ScriptStatus.READY ? handlePay : load}
    >
      <GooglePayIcon />
    </button>
  );
};

export default GooglePay;

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

const useStyles = makeStyles(() => ({
  button: {
    border: 0,
    backgroundColor: 'transparent',
    padding: 0,
  },
}));

export const GooglePayChip: React.FC<{}> = () => {
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const status = useScript('https://pay.google.com/gp/p/js/pay.js');
  const { data } = useClientToken();

  React.useEffect(() => {
    if (status === 'ready' && data) {
      initGooglePaymentInstance(data.client_token as string);
    }
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
      doToast
    );
  };

  return (
    <button className={classes.button} onClick={handlePay}>
      <GooglePayIcon />
    </button>
  );
};

export default GooglePayChip;

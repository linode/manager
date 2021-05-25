import * as React from 'react';
import * as braintree from 'braintree-web';
import { useEffect } from 'react';
import { ScriptStatus, useLazyScript } from 'src/hooks/useScript';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { SetSuccess } from './types';
import GooglePayIcon from 'src/assets/icons/payment/googlePayButton.svg';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    border: 0,
    backgroundColor: 'transparent',
    marginTop: theme.spacing(),
    padding: 0,
  },
  svg: {
    borderRadius: 5,
  },
}));

interface Props {
  usd: string;
  setSuccess: SetSuccess;
}

const GooglePay: React.FC<Props> = (props) => {
  const { setSuccess, usd } = props;
  const classes = useStyles();
  const { status, load } = useLazyScript(
    'https://pay.google.com/gp/p/js/pay.js'
  );

  const handlePay = () => {
    const client = new google.payments.api.PaymentsClient({
      environment: 'TEST',
    });

    initPayment(process.env.REACT_APP_BT_TOKEN || '', client, {
      totalPriceStatus: 'FINAL',
      totalPrice: '123.45',
      currencyCode: 'USD',
      countryCode: 'US',
    });
  };

  const initPayment = async (
    clientToken: string,
    googlePayClient: any,
    transactionInfo: any
  ) => {
    const client = await braintree.client.create({
      // This is will be the client token we get from API v4
      authorization: clientToken,
    });

    const googlePayment = await braintree.googlePayment.create({
      client,
      googlePayVersion: 2,
      // googleMerchantId: 'merchant-id-from-google'
    });

    const transaction = await googlePayment.createPaymentDataRequest({
      merchantInfo: {
        merchantId: '12345678901234567890',
      },
      transactionInfo,
    });

    const isReadyToPay = await googlePayClient.isReadyToPay({
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: transaction.allowedPaymentMethods,
    });

    if (!isReadyToPay) {
      setSuccess('Your device does not support Google Pay.');
    }

    try {
      const paymentData = await googlePayClient.loadPaymentData(transaction);

      await googlePayment.parseResponse(paymentData);
      setSuccess(`Payment for $${usd} successfully submitted`, true);
    } catch (error) {
      if ((error.message as string).includes('User closed')) {
        setSuccess('Payment Cancelled');
      } else {
        setSuccess('Payment was not completed.');
      }
    }
  };

  useEffect(() => {
    if (status == ScriptStatus.READY) {
      handlePay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status == ScriptStatus.ERROR) {
    return (
      <Grid container direction="column">
        <Notice error text="There was an error connecting with Google Pay." />
      </Grid>
    );
  }

  return (
    <button
      className={classes.button}
      onClick={status == ScriptStatus.READY ? handlePay : load}
    >
      <GooglePayIcon className={classes.svg} />
    </button>
  );
};

export default GooglePay;

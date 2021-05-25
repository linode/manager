import * as React from 'react';
import * as braintree from 'braintree-web';
import { useEffect } from 'react';
import { useLazyScript } from 'src/hooks/useScript';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import { ScriptStatus } from 'src/hooks/useScript';
import { makeStyles } from 'src/components/core/styles';

const useStyles = makeStyles(() => ({
  button: {
    border: 0,
    backgroundColor: 'transparent',
    padding: 0,
  },
}));

const GooglePay: React.FC<{}> = () => {
  const classes = useStyles();
  const { status, load } = useLazyScript(
    'https://pay.google.com/gp/p/js/pay.js'
  );

  const handlePay = () => {
    const client = new google.payments.api.PaymentsClient({
      environment: 'TEST',
    });

    initPayment(process.env.REACT_APP_BT_TOKEN || '', client, {
      currencyCode: 'USD',
      totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
    });
  };

  const initPayment = async (
    clientToken: string,
    googlePayClient: any,
    transactionInfo: any
  ) => {
    if (status == ScriptStatus.READY) {
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
        // merchantInfo: {
        //   merchantId: 'kbnt2g7qd2q2m8p6'
        // },
        transactionInfo,
      });

      const isReadyToPay = await googlePayClient.isReadyToPay({
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: transaction.allowedPaymentMethods,
      });

      if (!isReadyToPay) {
        return;
      }

      const paymentData = await googlePayClient.loadPaymentData(transaction);

      const parsed = await googlePayment.parseResponse(paymentData);

      alert(parsed);
    }
  };

  useEffect(() => {
    if (status == ScriptStatus.READY) {
      handlePay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

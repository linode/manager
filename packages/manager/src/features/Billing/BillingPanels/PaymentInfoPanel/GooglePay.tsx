import * as React from 'react';
import * as braintree from 'braintree-web';
import { useEffect } from 'react';
import { useLazyScript } from 'src/hooks/useLazyScript';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import { ScriptStatus } from 'src/hooks/useScript';
 import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    border: 0,
    backgroundColor: 'transparent'
  }
}));

const GooglePay: React.FC<{}> = (props) => {
  const { status, load } = useLazyScript('https://pay.google.com/gp/p/js/pay.js');
  const classes = useStyles();

  const handlePay = () => {
    const client = new google.payments.api.PaymentsClient({
      environment: 'TEST'
    });

    initPayment(
      process.env.REACT_APP_BT_TOKEN || '',
      client,
      {
        currencyCode: 'USD',
        totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
      }
    );
  }

  const initPayment = async (clientToken: string, googlePayClient: any, transactionInfo: any) => {
    if (status == ScriptStatus.READY) {
      const client = await braintree.client.create({
        //This is will be the client token we get from API v4
        authorization: clientToken
      });

      const googlePayment = await braintree.googlePayment.create({
        client: client,
        googlePayVersion: 2,
        //googleMerchantId: 'merchant-id-from-google'
      });

      const transaction = await googlePayment.createPaymentDataRequest({
        // merchantInfo: {
        //   merchantId: 'kbnt2g7qd2q2m8p6'
        // },
        transactionInfo: transactionInfo
      });

      const isReadyToPay = await googlePayClient.isReadyToPay({
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: transaction.allowedPaymentMethods,
      });
      
      if (isReadyToPay) console.log("Ready to initialize adding payment method");
      else console.log("Unable to init google pay");

      try {
        const paymentData = await googlePayClient.loadPaymentData(transaction);

        const parsed = await googlePayment.parseResponse(paymentData);

        console.log("Payment data with nonce", parsed);
      }
      catch (error) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
    if (status == ScriptStatus.READY) {
      handlePay();
    }
  }, [status]);

  return <button className={classes.button} onClick={status == ScriptStatus.READY ? handlePay : load}><GooglePayIcon /></button>;
}

export default GooglePay;

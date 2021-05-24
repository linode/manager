import * as React from 'react';
import * as braintree from 'braintree-web';
import { useEffect, useState, useRef } from 'react';
import { ScriptStatus, useScript } from 'src/hooks/useScript';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { SetSuccess } from './types';
import CircleProgress from 'src/components/CircleProgress';
import GooglePayIcon from 'src/assets/icons/payment/googlePayButton.svg';
// import { makeStyles, Theme } from 'src/components/core/styles';

// const useStyles = makeStyles((theme: Theme) => ({
// }));

interface TransactionInfo {
  currencyCode: string;
  totalPriceStatus: string;
  totalPrice: string;
}

interface Props {
  usd: string;
  setSuccess: SetSuccess;
}

const clientToken = `braintree client token here`;

const GooglePay: React.FC<Props> = (props) => {
  const googlePayStatus = useScript('https://pay.google.com/gp/p/js/pay.js');
  const { setSuccess, usd } = props;
  //const classes = useStyles();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  const initPayment = async (clientToken: string, googlePayClient: any, transactionInfo: TransactionInfo) => {
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

    setIsReady(isReadyToPay);

    const startPayment = async () => {
      try {
        const paymentData = await googlePayClient.loadPaymentData(transaction);
        const parsed = await googlePayment.parseResponse(paymentData);
        setSuccess(
          `Payment for $${usd} successfully submitted`,
          true
        );
        console.log("Payment data with nonce", parsed);
      }
      catch (error) {
        if ((error.message as string).includes("User closed")) {
          setSuccess('Payment Cancelled');
        }
        else {
          setSuccess('Payment was not completed.');
        }
      }
    }
    buttonRef.current?.addEventListener('click', startPayment);
  }

  useEffect(() => {
    if (googlePayStatus == ScriptStatus.READY) {
      const client = new google.payments.api.PaymentsClient({
        environment: 'TEST'
      });

      initPayment(clientToken, client, {
        currencyCode: 'USD',
        totalPriceStatus: 'FINAL',
        totalPrice: usd
      });
    }
  }, [googlePayStatus]);

  if (googlePayStatus == ScriptStatus.LOADING || googlePayStatus == ScriptStatus.IDLE) {
    return (
      <Grid container direction="column">
        <CircleProgress mini />
      </Grid>
    );
  }

  if (googlePayStatus == ScriptStatus.ERROR) {
    return (
      <Grid container direction="column">
        <Notice error text="There was an error connecting with Google Pay." />
      </Grid>
    );
  }

  if (!isReady) return null;

  return <button ref={buttonRef}><GooglePayIcon /></button>;
}

export default GooglePay;

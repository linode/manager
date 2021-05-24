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

const clientToken = `eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpGVXpJMU5pSXNJbXRwWkNJNklqSXdNVGd3TkRJMk1UWXRjMkZ1WkdKdmVDSXNJbWx6Y3lJNkltaDBkSEJ6T2k4dllYQnBMbk5oYm1SaWIzZ3VZbkpoYVc1MGNtVmxaMkYwWlhkaGVTNWpiMjBpZlEuZXlKbGVIQWlPakUyTWpFNU56VTNOalVzSW1wMGFTSTZJamM1WW1aa05HUXdMV0U0TnpRdE5ERTNOUzA1WkRrNUxXWTBZMlEwWWpZeVpHVmhZeUlzSW5OMVlpSTZJbXRpYm5ReVp6ZHhaREp4TW0wNGNEWWlMQ0pwYzNNaU9pSm9kSFJ3Y3pvdkwyRndhUzV6WVc1a1ltOTRMbUp5WVdsdWRISmxaV2RoZEdWM1lYa3VZMjl0SWl3aWJXVnlZMmhoYm5RaU9uc2ljSFZpYkdsalgybGtJam9pYTJKdWRESm5OM0ZrTW5FeWJUaHdOaUlzSW5abGNtbG1lVjlqWVhKa1gySjVYMlJsWm1GMWJIUWlPbVpoYkhObGZTd2ljbWxuYUhSeklqcGJJbTFoYm1GblpWOTJZWFZzZENKZExDSnpZMjl3WlNJNld5SkNjbUZwYm5SeVpXVTZWbUYxYkhRaVhTd2liM0IwYVc5dWN5STZlMzE5LkJCOHJob25xOVkwZS1vNWNUMzJ4Zjkzckh0dWkySTVrVnpuU2pGdll5VXJFenR5cHlxZVRVTzhHUzlidWkxd3VTeEdoV2JUSl82b0pGNU5aRlFvWlZRIiwiY29uZmlnVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbTo0NDMvbWVyY2hhbnRzL2tibnQyZzdxZDJxMm04cDYvY2xpZW50X2FwaS92MS9jb25maWd1cmF0aW9uIiwiZ3JhcGhRTCI6eyJ1cmwiOiJodHRwczovL3BheW1lbnRzLnNhbmRib3guYnJhaW50cmVlLWFwaS5jb20vZ3JhcGhxbCIsImRhdGUiOiIyMDE4LTA1LTA4IiwiZmVhdHVyZXMiOlsidG9rZW5pemVfY3JlZGl0X2NhcmRzIl19LCJjbGllbnRBcGlVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMva2JudDJnN3FkMnEybThwNi9jbGllbnRfYXBpIiwiZW52aXJvbm1lbnQiOiJzYW5kYm94IiwibWVyY2hhbnRJZCI6ImtibnQyZzdxZDJxMm04cDYiLCJhc3NldHNVcmwiOiJodHRwczovL2Fzc2V0cy5icmFpbnRyZWVnYXRld2F5LmNvbSIsImF1dGhVcmwiOiJodHRwczovL2F1dGgudmVubW8uc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbSIsInZlbm1vIjoib2ZmIiwiY2hhbGxlbmdlcyI6W10sInRocmVlRFNlY3VyZUVuYWJsZWQiOnRydWUsImFuYWx5dGljcyI6eyJ1cmwiOiJodHRwczovL29yaWdpbi1hbmFseXRpY3Mtc2FuZC5zYW5kYm94LmJyYWludHJlZS1hcGkuY29tL2tibnQyZzdxZDJxMm04cDYifSwicGF5cGFsRW5hYmxlZCI6dHJ1ZSwicGF5cGFsIjp7ImJpbGxpbmdBZ3JlZW1lbnRzRW5hYmxlZCI6dHJ1ZSwiZW52aXJvbm1lbnROb05ldHdvcmsiOnRydWUsInVudmV0dGVkTWVyY2hhbnQiOmZhbHNlLCJhbGxvd0h0dHAiOnRydWUsImRpc3BsYXlOYW1lIjoiSWFuICYgQmFua3MgTExDIiwiY2xpZW50SWQiOm51bGwsInByaXZhY3lVcmwiOiJodHRwOi8vZXhhbXBsZS5jb20vcHAiLCJ1c2VyQWdyZWVtZW50VXJsIjoiaHR0cDovL2V4YW1wbGUuY29tL3RvcyIsImJhc2VVcmwiOiJodHRwczovL2Fzc2V0cy5icmFpbnRyZWVnYXRld2F5LmNvbSIsImFzc2V0c1VybCI6Imh0dHBzOi8vY2hlY2tvdXQucGF5cGFsLmNvbSIsImRpcmVjdEJhc2VVcmwiOm51bGwsImVudmlyb25tZW50Ijoib2ZmbGluZSIsImJyYWludHJlZUNsaWVudElkIjoibWFzdGVyY2xpZW50MyIsIm1lcmNoYW50QWNjb3VudElkIjoiaWFuYmFua3NsbGMiLCJjdXJyZW5jeUlzb0NvZGUiOiJVU0QifX0`;

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

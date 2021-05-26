import braintree, { GooglePayment } from 'braintree-web';
import { SetSuccess } from '../BillingPanels/BillingSummary/PaymentDrawer/types';
import { getBraintreeClient } from './Braintree';

export default class GooglePayClient {
  private googlePayClient: google.payments.api.PaymentsClient | null;

  constructor() {
    const isGooglePayInitialized = window.hasOwnProperty('paypal');

    if (!isGooglePayInitialized) {
      this.googlePayClient = null;
    }

    this.googlePayClient = new google.payments.api.PaymentsClient({
      environment: 'TEST',
      paymentDataCallbacks: {
        onPaymentAuthorized: this.onPaymentAuthorized,
      },
    });
  }

  // send nonce to API
  private onPaymentAuthorized(
    paymentData: google.payments.api.PaymentData
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log('authorized', paymentData)
      resolve({ transactionState: 'SUCCESS' });
    });
  }

  private async getGooglePayBraintreeClient(
    client_token: string
  ): Promise<GooglePayment> {
    return await braintree.googlePayment.create({
      client: await getBraintreeClient(client_token),
      googlePayVersion: 2,
      // googleMerchantId: 'merchant-id-from-google'
    });
  }

  public async init(
    client_token: string,
    transactionInfo: any,
    setSuccess: SetSuccess
  ) {
    const braintreeGooglePayment = await this.getGooglePayBraintreeClient(
      client_token
    );

    const transaction = await braintreeGooglePayment.createPaymentDataRequest({
      // merchantInfo: {
      //   merchantId: '12345678901234567890',
      // },
      transactionInfo,
      // @ts-expect-error createPaymentDataRequest object type is missing callbackIntents
      callbackIntents: ['PAYMENT_AUTHORIZATION'],
    });

    if (!this.googlePayClient) {
      return setSuccess('Unable to create Google Pay JS client.');
    }

    const isReadyToPay = await this.googlePayClient.isReadyToPay({
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: transaction.allowedPaymentMethods,
    });

    if (!isReadyToPay) {
      return setSuccess('Your device does not support Google Pay.');
    }

    try {
      const paymentData = await this.googlePayClient.loadPaymentData(
        transaction
      );

      await braintreeGooglePayment.parseResponse(paymentData);

      setSuccess(
        `Payment for $${transactionInfo.totalPrice} successfully submitted`,
        true
      );
    } catch (error) {
      if ((error.message as string).includes('User closed')) {
        setSuccess('Payment Cancelled');
      } else {
        setSuccess('Payment was not completed.');
      }
    }
  }
}

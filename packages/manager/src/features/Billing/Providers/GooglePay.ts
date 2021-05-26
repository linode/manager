import braintree, { GooglePayment } from 'braintree-web';
import { VariantType } from 'notistack';
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
    transactionInfo: Omit<google.payments.api.TransactionInfo, 'totalPrice'> & {
      totalPrice?: string;
    },
    setMessage: (message: string, variant: VariantType) => void
  ) {
    const isOneTimePayment =
      transactionInfo.totalPrice &&
      transactionInfo.totalPriceStatus === 'FINAL';

    const braintreeGooglePayment = await this.getGooglePayBraintreeClient(
      client_token
    );

    const transaction = await braintreeGooglePayment.createPaymentDataRequest({
      // merchantInfo: {
      //   merchantId: '12345678901234567890',
      // },
      // @ts-expect-error braintree's types are not accurate
      transactionInfo,
      callbackIntents: ['PAYMENT_AUTHORIZATION'],
    });

    if (!this.googlePayClient) {
      return setMessage('Unable to create Google Pay JS client.', 'error');
    }

    const isReadyToPay = await this.googlePayClient.isReadyToPay({
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: transaction.allowedPaymentMethods,
    });

    if (!isReadyToPay) {
      return setMessage('Your device does not support Google Pay.', 'warning');
    }

    try {
      const paymentData = await this.googlePayClient.loadPaymentData(
        transaction
      );

      await braintreeGooglePayment.parseResponse(paymentData);

      setMessage(
        isOneTimePayment
          ? `Payment for $${transactionInfo.totalPrice} successfully submitted`
          : 'Successfully Added Google Pay',
        'success'
      );
    } catch (error) {
      if ((error.message as string).includes('User closed')) {
        setMessage(
          isOneTimePayment ? 'Payment Cancelled' : 'Canceled adding Google Pay',
          'warning'
        );
      } else {
        setMessage(
          isOneTimePayment
            ? 'Payment was not completed'
            : 'Unable to add payment method',
          'error'
        );
      }
    }
  }
}

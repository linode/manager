import braintree, { GooglePayment } from 'braintree-web';
import { VariantType } from 'notistack';

let googlePaymentInstance: GooglePayment | undefined;

const onPaymentAuthorized = (
  paymentData: google.payments.api.PaymentData
): Promise<any> => {
  return new Promise((resolve, reject) => {
    resolve({ transactionState: 'SUCCESS' });
  });
};

export const initGooglePaymentInstance = async (
  client_token: string
): Promise<void> => {
  const braintreeClientToken = await braintree.client.create({
    authorization: client_token,
  });

  googlePaymentInstance = await braintree.googlePayment.create({
    client: braintreeClientToken,
    googlePayVersion: 2,
    // googleMerchantId: 'merchant-id-from-google'
  });
};

export const makePayment = async (
  transactionInfo: Omit<google.payments.api.TransactionInfo, 'totalPrice'> & {
    totalPrice?: string;
  },
  setMessage: (message: string, variant: VariantType) => void
) => {
  if (!googlePaymentInstance) {
    return setMessage('Unable to open Google Pay.', 'error');
  }

  let paymentDataRequest;

  try {
    paymentDataRequest = await googlePaymentInstance.createPaymentDataRequest({
      // merchantInfo: {
      //   merchantId: '12345678901234567890',
      // },
      // @ts-expect-error braintree's types are not accurate
      transactionInfo,
      callbackIntents: ['PAYMENT_AUTHORIZATION'],
    });
  } catch (error) {
    return setMessage('Unable to open Google Pay.', 'error');
  }

  const googlePayClient = new google.payments.api.PaymentsClient({
    environment: 'TEST',
    paymentDataCallbacks: {
      onPaymentAuthorized,
    },
  });
  const isReadyToPay = await googlePayClient.isReadyToPay({
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: paymentDataRequest.allowedPaymentMethods,
  });
  if (!isReadyToPay) {
    return setMessage('Your device does not support Google Pay.', 'warning');
  }

  const isOneTimePayment =
    transactionInfo.totalPrice && transactionInfo.totalPriceStatus === 'FINAL';

  try {
    const paymentData = await googlePayClient.loadPaymentData(
      paymentDataRequest
    );
    const { nonce } = await googlePaymentInstance.parseResponse(paymentData);
    // send nonce to API

    setMessage(
      isOneTimePayment
        ? `Payment for $${transactionInfo.totalPrice} successfully submitted`
        : 'Successfully Added Google Pay',
      'success'
    );
  } catch (error) {
    if (error.message && (error.message as string).includes('User closed')) {
      return;
    }
    setMessage(
      isOneTimePayment
        ? 'Unable to complete payment'
        : 'Unable to add payment method',
      'error'
    );
  }
};

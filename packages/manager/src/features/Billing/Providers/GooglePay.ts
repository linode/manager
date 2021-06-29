import braintree, { GooglePayment } from 'braintree-web';
// import { GPAY_MERCHANT_ID } from 'src/constants';
import {
  addPaymentMethod,
  makePayment,
} from '@linode/api-v4/lib/account/payments';
import { VariantType } from 'notistack';
import { queryClient } from 'src/queries/base';
import { getAllPaymentMethodsRequest } from 'src/queries/accountPayment';

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

export const gPay = async (
  action: 'one-time-payment' | 'add-recurring-payment',
  transactionInfo: Omit<google.payments.api.TransactionInfo, 'totalPrice'> & {
    totalPrice?: string;
  },
  setMessage: (message: string, variant: VariantType) => void,
  onSuccess?: () => void
) => {
  if (!googlePaymentInstance) {
    return setMessage('Unable to open Google Pay.', 'error');
  }

  let paymentDataRequest;

  try {
    paymentDataRequest = await googlePaymentInstance.createPaymentDataRequest({
      // merchantInfo: {
      //   merchantId: GPAY_MERCHANT_ID || '',
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

  const isOneTimePayment = action === 'one-time-payment';

  try {
    const paymentData = await googlePayClient.loadPaymentData(
      paymentDataRequest
    );
    const { nonce } = await googlePaymentInstance.parseResponse(paymentData);

    // @TODO handle these API calls if they fail and maybe use React Query mutations?
    if (isOneTimePayment) {
      await makePayment({
        nonce: 'fake-android-pay-nonce', // use actual nonce later
        usd: transactionInfo.totalPrice as string,
      });
    } else {
      await addPaymentMethod({
        type: 'payment_method_nonce',
        data: { nonce: 'fake-android-pay-nonce' },
        is_default: true,
      });
      if (onSuccess) {
        onSuccess();
      }
      await queryClient.refetchQueries(['account-payment-methods-all']);
    }

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
    // @TODO log to Sentry
    setMessage(
      isOneTimePayment
        ? 'Unable to complete Google Pay payment'
        : 'Unable to add payment method',
      'error'
    );
  }
};

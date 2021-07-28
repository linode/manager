import braintree, { GooglePayment } from 'braintree-web';
import {
  addPaymentMethod,
  makePayment,
} from '@linode/api-v4/lib/account/payments';
import { APIWarning } from '@linode/api-v4/lib/types';
import { VariantType } from 'notistack';
import { queryClient } from 'src/queries/base';
import { queryKey as accountPaymentKey } from 'src/queries/accountPayment';
import { queryKey as accountBillingKey } from 'src/queries/accountBilling';
import { GPAY_CLIENT_ENV, GPAY_MERCHANT_ID } from 'src/constants';
import { PaymentMethod } from '@linode/api-v4/lib/account';
import { reportException } from 'src/exceptionReporting';

const merchantInfo: google.payments.api.MerchantInfo = {
  merchantId: GPAY_MERCHANT_ID || '',
  merchantName: 'Linode',
};

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
    googleMerchantId: GPAY_MERCHANT_ID,
  });
};

export const gPay = async (
  action: 'one-time-payment' | 'add-recurring-payment',
  transactionInfo: Omit<google.payments.api.TransactionInfo, 'totalPrice'> & {
    totalPrice?: string;
  },
  setMessage: (
    message: string,
    variant: VariantType,
    warnings?: APIWarning[]
  ) => void,
  setProcessing: (processing: boolean) => void
) => {
  if (!googlePaymentInstance) {
    return setMessage('Unable to open Google Pay.', 'error');
  }

  let paymentDataRequest;

  try {
    paymentDataRequest = await googlePaymentInstance.createPaymentDataRequest({
      merchantInfo,
      // @ts-expect-error Braintree types are wrong
      transactionInfo,
      callbackIntents: ['PAYMENT_AUTHORIZATION'],
    });
  } catch (error) {
    reportException(error, {
      message: 'Unable to open Google Pay.',
    });
    return setMessage('Unable to open Google Pay.', 'error');
  }

  const googlePayClient = new google.payments.api.PaymentsClient({
    environment: GPAY_CLIENT_ENV as google.payments.api.Environment,
    merchantInfo,
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
    return setMessage('Your device does not support Google Pay.', 'error');
  }

  const isOneTimePayment = action === 'one-time-payment';

  try {
    const paymentData = await googlePayClient.loadPaymentData(
      paymentDataRequest
    );

    const { nonce: realNonce } = await googlePaymentInstance.parseResponse(
      paymentData
    );

    // Use the real nonce (real money) when the Google Merchant ID is provided and
    // the Google Pay environment is set to production.
    const nonce =
      Boolean(GPAY_MERCHANT_ID) && GPAY_CLIENT_ENV === 'PRODUCTION'
        ? realNonce
        : 'fake-android-pay-nonce';

    setProcessing(true);

    if (isOneTimePayment) {
      const response = await makePayment({
        nonce,
        usd: transactionInfo.totalPrice as string,
      });
      queryClient.invalidateQueries(`${accountBillingKey}-payments`);
      setMessage(
        `Payment for $${transactionInfo.totalPrice} successfully submitted with Google Pay`,
        'success',
        response.warnings
      );
    } else {
      const paymentMethods = queryClient.getQueryData<PaymentMethod[]>(
        `${accountPaymentKey}-all`
      );

      /**
       * Make Google Pay default if
       * - They have no payment methods
       * - Their previous default payment method was Google Pay
       *
       * We determined this to make sure a user's payment method
       * does not abruptly switch after "Editing" it.
       * @TODO remove this logic when user can have more payment methods
       */
      const shouldBecomeDefault =
        paymentMethods?.length === 0 ||
        paymentMethods?.find(
          (method: PaymentMethod) => method.is_default === true
        )?.type === 'google_pay';

      await addPaymentMethod({
        type: 'payment_method_nonce',
        data: { nonce },
        is_default: shouldBecomeDefault,
      });
      queryClient.invalidateQueries(`${accountPaymentKey}-all`);
      setMessage('Successfully added Google Pay', 'success');
    }

    setProcessing(false);
  } catch (error) {
    setProcessing(false);
    if (error.message && (error.message as string).includes('User closed')) {
      return;
    }

    const errorMsg = isOneTimePayment
      ? 'Unable to complete Google Pay payment'
      : 'Unable to add payment method';

    reportException(error, {
      message: errorMsg,
    });
    // @TODO Consider checking if error is an APIError so we can provide a more descriptive error message.
    setMessage(errorMsg, 'error');
  }
};

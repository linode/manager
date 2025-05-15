import {
  addPaymentMethod,
  makePayment,
} from '@linode/api-v4/lib/account/payments';
import { accountQueries } from '@linode/queries';
import braintree from 'braintree-web';

import { GPAY_CLIENT_ENV, GPAY_MERCHANT_ID } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { APIWarning } from '@linode/api-v4/lib/types';
import type { QueryClient } from '@tanstack/react-query';
import type { GooglePayment } from 'braintree-web';
import type { VariantType } from 'notistack';
import type { PaymentMessage } from 'src/features/Billing/BillingPanels/PaymentInfoPanel/AddPaymentMethodDrawer/AddPaymentMethodDrawer';

const merchantInfo: google.payments.api.MerchantInfo = {
  merchantId: GPAY_MERCHANT_ID || '',
  merchantName: 'Linode',
};

const unableToOpenGPayError = 'Unable to open Google Pay.';
let googlePaymentInstance: GooglePayment;

const onPaymentAuthorized = (
  paymentData: google.payments.api.PaymentData
): Promise<any> => {
  return Promise.resolve({ transactionState: 'SUCCESS' });
};

export const initGooglePaymentInstance = async (
  client_token: string
): Promise<{ error: boolean }> => {
  try {
    const braintreeClientToken = await braintree.client.create({
      authorization: client_token,
    });

    googlePaymentInstance = await braintree.googlePayment.create({
      client: braintreeClientToken,
      googleMerchantId: GPAY_MERCHANT_ID,
      googlePayVersion: 2,
    });
  } catch (error) {
    reportException(error, {
      message: 'Error initializing Google Pay.',
    });
    return { error: true };
  }
  return { error: false };
};

interface TransactionInfo
  extends Omit<google.payments.api.TransactionInfo, 'totalPrice'> {
  totalPrice?: string;
}

const tokenizePaymentDataRequest = async (transactionInfo: TransactionInfo) => {
  if (!googlePaymentInstance) {
    return Promise.reject(unableToOpenGPayError);
  }

  const paymentDataRequest =
    await googlePaymentInstance.createPaymentDataRequest({
      callbackIntents: ['PAYMENT_AUTHORIZATION'],
      merchantInfo,
      // @ts-expect-error Braintree types are wrong
      transactionInfo,
    });

  const googlePayClient = new google.payments.api.PaymentsClient({
    environment: GPAY_CLIENT_ENV as google.payments.api.Environment,
    merchantInfo,
    paymentDataCallbacks: {
      onPaymentAuthorized,
    },
  });

  const isReadyToPay = await googlePayClient.isReadyToPay({
    allowedPaymentMethods: paymentDataRequest.allowedPaymentMethods,
    apiVersion: 2,
    apiVersionMinor: 0,
  });
  if (!isReadyToPay) {
    return Promise.reject('Your device does not support Google Pay.');
  }

  const paymentData = await googlePayClient.loadPaymentData(paymentDataRequest);

  const { nonce: realNonce } =
    await googlePaymentInstance.parseResponse(paymentData);

  // Use the real nonce (real money) when the Google Merchant ID is provided and
  // the Google Pay environment is set to production.
  const nonce =
    Boolean(GPAY_MERCHANT_ID) && GPAY_CLIENT_ENV === 'PRODUCTION'
      ? realNonce
      : 'fake-android-pay-nonce';
  return Promise.resolve(nonce);
};

export const gPay = async (
  action: 'add-recurring-payment' | 'one-time-payment',
  transactionInfo: TransactionInfo,
  setMessage: (message: PaymentMessage, warnings?: APIWarning[]) => void,
  setProcessing: (processing: boolean) => void,
  queryClient: QueryClient
) => {
  const makeOneTimePayment = async (nonce: string) => {
    const response = await makePayment({
      nonce,
      usd: transactionInfo.totalPrice as string,
    });
    queryClient.invalidateQueries({
      queryKey: accountQueries.payments._def,
    });
    const message = {
      text: `Payment for $${transactionInfo.totalPrice} successfully submitted with Google Pay`,
      variant: 'success' as VariantType,
    };
    setMessage(message, response.warnings);
  };

  const addRecurringPayment = async (nonce: string) => {
    await addPaymentMethod({
      data: { nonce },
      is_default: true,
      type: 'payment_method_nonce',
    });
    queryClient.invalidateQueries({
      queryKey: accountQueries.paymentMethods.queryKey,
    });
    setMessage({
      text: 'Successfully added Google Pay',
      variant: 'success',
    });
  };

  tokenizePaymentDataRequest(transactionInfo)
    .then(async (nonce: string) => {
      const isOneTimePayment = action === 'one-time-payment';

      try {
        setProcessing(true);
        if (isOneTimePayment) {
          await makeOneTimePayment(nonce);
        } else {
          await addRecurringPayment(nonce);
        }
        setProcessing(false);
      } catch (error) {
        setProcessing(false);

        const errorMsg = isOneTimePayment
          ? 'Unable to complete Google Pay payment'
          : 'Unable to add payment method';
        reportException(error, {
          message: errorMsg,
        });
        setMessage({
          text: getAPIErrorOrDefault(error, errorMsg)[0].reason,
          variant: 'error',
        });
      }
    })
    .catch((error) => {
      if (!error || error.statusCode === 'CANCELED') {
        return;
      }
      reportException(error, {
        message: unableToOpenGPayError,
      });
      setMessage({
        text: unableToOpenGPayError,
        variant: 'error',
      });
    });
};

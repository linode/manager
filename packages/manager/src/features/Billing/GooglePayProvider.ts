import {
  addPaymentMethod,
  makePayment,
} from '@linode/api-v4/lib/account/payments';
import { APIWarning } from '@linode/api-v4/lib/types';
import braintree, { GooglePayment } from 'braintree-web';
import { VariantType } from 'notistack';
import { QueryClient } from 'react-query';

import { GPAY_CLIENT_ENV, GPAY_MERCHANT_ID } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { PaymentMessage } from 'src/features/Billing/BillingPanels/PaymentInfoPanel/AddPaymentMethodDrawer/AddPaymentMethodDrawer';
import { queryKey as accountBillingKey } from 'src/queries/accountBilling';
import { queryKey as accountPaymentKey } from 'src/queries/accountPayment';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const merchantInfo: google.payments.api.MerchantInfo = {
  merchantId: GPAY_MERCHANT_ID || '',
  merchantName: 'Linode',
};

const unableToOpenGPayError = 'Unable to open Google Pay.';
let googlePaymentInstance: GooglePayment;

const onPaymentAuthorized = (
  paymentData: google.payments.api.PaymentData
): Promise<any> => {
  return new Promise((resolve, reject) => {
    resolve({ transactionState: 'SUCCESS' });
  });
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

const tokenizePaymentDataRequest = async (
  transactionInfo: Omit<google.payments.api.TransactionInfo, 'totalPrice'> & {
    totalPrice?: string;
  }
) => {
  if (!googlePaymentInstance) {
    return Promise.reject(unableToOpenGPayError);
  }

  const paymentDataRequest = await googlePaymentInstance.createPaymentDataRequest(
    {
      callbackIntents: ['PAYMENT_AUTHORIZATION'],
      merchantInfo,
      // @ts-expect-error Braintree types are wrong
      transactionInfo,
    }
  );

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

  const { nonce: realNonce } = await googlePaymentInstance.parseResponse(
    paymentData
  );

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
  transactionInfo: Omit<google.payments.api.TransactionInfo, 'totalPrice'> & {
    totalPrice?: string;
  },
  setMessage: (message: PaymentMessage, warnings?: APIWarning[]) => void,
  setProcessing: (processing: boolean) => void,
  queryClient: QueryClient
) => {
  const makeOneTimePayment = async (nonce: string) => {
    const response = await makePayment({
      nonce,
      usd: transactionInfo.totalPrice as string,
    });
    queryClient.invalidateQueries(`${accountBillingKey}-payments`);
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
    queryClient.invalidateQueries(`${accountPaymentKey}-all`);
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

import {
  CreditCardSchema,
  ExecutePaypalPaymentSchema,
  PaymentSchema,
  StagePaypalPaymentSchema,
  PaymentMethodSchema,
} from '@linode/validation/lib/account.schema';
import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { ResourcePage } from '../types';
import {
  ClientToken,
  ExecutePayload,
  Payment,
  PaymentMethod,
  PaymentResponse,
  Paypal,
  PaypalResponse,
  SaveCreditCardData,
  PaymentMethodData,
  MakePaymentData,
} from './types';

/**
 * getPayments
 *
 * Retrieve a paginated list of the most recent payments made
 * on your account.
 *
 */
export const getPayments = (params?: any, filter?: any) =>
  Request<ResourcePage<Payment>>(
    setURL(`${API_ROOT}/account/payments`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  );

/**
 * makePayment
 *
 * Make a payment using the currently active credit card on your
 * account, a nonce, or by another payment method on your account
 * (by providing its id).
 *
 * @param data { object }
 * @param data.usd { string } the dollar amount of the payment
 * @param data.cvv { string } the 3-digit code on the back of the
 * @param data.nonce { string } the payment nonce to make a one time payment
 * @param data.payment_method_id { number } the payment nonce to make a one time payment
 *
 */
export const makePayment = (data: MakePaymentData) => {
  /**
   * in the context of APIv4, CVV is optional - in other words, it's totally
   * valid to submit a payment without a CVV
   *
   * BUT if CVV is included in the payload, APIv4 will send an error that CVV must
   * have 3-4 characters.
   *
   * Both of these examples will pass:
   *
   * {
   *   usd: 5,
   *   cvv: ''
   * }
   *
   * {
   *   usd: 5
   * }
   */
  if (!data.cvv) {
    delete data.cvv;
  }

  return Request<PaymentResponse>(
    setURL(`${API_ROOT}/account/payments`),
    setMethod('POST'),
    setData(data, PaymentSchema)
  );
};

interface StagePaypalData {
  checkout_token: string;
  payment_id: string;
}

/**
 * stagePaypalPayment
 *
 * Begins the process of making a payment through Paypal.
 *
 * @param data { object }
 * @param data.cancel_url The URL to have PayPal redirect to when Payment is cancelled.
 * @param data.redirect_url The URL to have PayPal redirect to when Payment is approved.
 * @param data.usd { string } The dollar amount of the payment
 *
 * @returns a payment ID, used for submitting the payment to Paypal.
 *
 */
export const stagePaypalPayment = (data: Paypal) =>
  Request<StagePaypalData>(
    setURL(`${API_ROOT}/account/payments/paypal`),
    setMethod('POST'),
    setData(data, StagePaypalPaymentSchema)
  );

/**
 * executePaypalPayment
 *
 * Executes a payment through Paypal that has been started with the
 * stagePaypalPayment method above. Paypal will capture the designated
 * funds and credit your Linode account.
 *
 * @param data { object }
 * @param data.payment_id The ID returned by stagePaypalPayment
 * @param data.payer_id The PayerID returned by PayPal during the transaction authorization process.
 *
 */
export const executePaypalPayment = (data: ExecutePayload) =>
  Request<PaypalResponse>(
    setURL(`${API_ROOT}/account/payments/paypal/execute`),
    setMethod('POST'),
    setData(data, ExecutePaypalPaymentSchema)
  );

/**
 * saveCreditCard
 *
 * Add or update credit card information to your account. Only one
 * card is allowed per account, so this method will overwrite any
 * existing information.
 *
 */
export const saveCreditCard = (data: SaveCreditCardData) => {
  return Request<{}>(
    setURL(`${API_ROOT}/account/credit-card`),
    setMethod('POST'),
    setData(data, CreditCardSchema)
  );
};

/**
 * getPaymentMethods
 *
 * Gets a paginatated list of all the payment methods avalible
 * on a user's account
 *
 */
export const getPaymentMethods = (params?: any) => {
  return Request<ResourcePage<PaymentMethod>>(
    setURL(`${API_ROOT}/account/payment-methods`),
    setMethod('GET'),
    setParams(params)
  );
};

/**
 * getClientToken
 *
 * Gets a unique token that is used to interact with the
 * Braintree front-end SDK
 *
 */
export const getClientToken = () => {
  return Request<ClientToken>(
    setURL(`${API_ROOT}/account/client-token`),
    setMethod('GET')
  );
};

/**
 * addPaymentMethod
 *
 * Adds a new payment method to a user's account via a nonce.
 *
 * @param data { object }
 * @param data.nonce { string } the nonce for the payment method to be added
 * @param data.is_default { boolean } whether of not this payment method should
 * become a user's default method of payment
 *
 */
export const addPaymentMethod = (data: PaymentMethodData) => {
  return Request<{}>(
    setURL(`${API_ROOT}/account/payment-methods`),
    setMethod('POST'),
    setData(data, PaymentMethodSchema)
  );
};

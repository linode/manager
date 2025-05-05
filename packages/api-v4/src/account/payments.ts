import {
  CreditCardSchema,
  PaymentMethodSchema,
  PaymentSchema,
} from '@linode/validation/lib/account.schema';

import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, Params, ResourcePage } from '../types';
import type {
  ClientToken,
  MakePaymentData,
  Payment,
  PaymentMethod,
  PaymentMethodPayload,
  PaymentResponse,
  SaveCreditCardData,
} from './types';

/**
 * getPayments
 *
 * Retrieve a paginated list of the most recent payments made
 * on your account.
 *
 */
export const getPayments = (params?: Params, filter?: Filter) =>
  Request<ResourcePage<Payment>>(
    setURL(`${API_ROOT}/account/payments`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
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
    setData(data, PaymentSchema),
  );
};

/**
 * saveCreditCard
 *
 * Add or update credit card information to your account. Only one
 * card is allowed per account, so this method will overwrite any
 * existing information.
 * @deprecated Use POST /account/payment-methods
 */
export const saveCreditCard = (data: SaveCreditCardData) => {
  return Request<{}>(
    setURL(`${API_ROOT}/account/credit-card`),
    setMethod('POST'),
    setData(data, CreditCardSchema),
  );
};

/**
 * getPaymentMethods
 *
 * Gets a paginatated list of all the payment methods avalible
 * on a user's account
 *
 */
export const getPaymentMethods = (params?: Params) => {
  return Request<ResourcePage<PaymentMethod>>(
    setURL(`${API_ROOT}/account/payment-methods`),
    setMethod('GET'),
    setParams(params),
  );
};

/**
 * getPaymentMethod
 *
 * Gets information about a specific payment method on
 * your account.
 *
 * @param id {number} the id of the payment method
 *
 */
export const getPaymentMethod = (id: number) => {
  return Request<PaymentMethod>(
    setURL(`${API_ROOT}/account/payment-method/${encodeURIComponent(id)}`),
    setMethod('GET'),
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
    setMethod('GET'),
  );
};

/**
 * addPaymentMethod
 *
 * Adds a new payment method to a user's account via a nonce.
 *
 * @param data { object }
 * @param data.type { string } 'credit_card' or 'payment_method_nonce'
 * @param data.is_default { boolean } whether or not this payment method should be considered the default
 * @param data.data { object } this will be data containing a nonce or credit card info
 * @param data.data.nonce { string } the nonce for the payment method to be added
 * @param data.data.card_number { string } a credit card number
 * @param data.data.expiry_year { number } credit card's expiry year
 * @param data.data.expiry_month { number } credit card's expiry month
 * @param data.data.cvv { string } credit card's cvv
 *
 */
export const addPaymentMethod = (data: PaymentMethodPayload) => {
  return Request<Record<string, never>>(
    setURL(`${API_ROOT}/account/payment-methods`),
    setMethod('POST'),
    setData(data, PaymentMethodSchema),
  );
};

/**
 * makeDefaultPaymentMethod
 *
 * Action endpoint to change your default payment method
 *
 * @param id {number} id of the payment method
 */
export const makeDefaultPaymentMethod = (id: number) => {
  return Request<{}>(
    setURL(
      `${API_ROOT}/account/payment-methods/${encodeURIComponent(
        id,
      )}/make-default`,
    ),
    setMethod('POST'),
  );
};

/**
 * deletePaymentMethod
 *
 * Delete the specifed payment method.
 *
 * @param id {number} The id of the payment method to delete.
 */
export const deletePaymentMethod = (id: number) => {
  return Request<{}>(
    setURL(`${API_ROOT}/account/payment-methods/${encodeURIComponent(id)}`),
    setMethod('DELETE'),
  );
};

import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setParams, setURL, setXFilter } from 'src/services';

import {
  CreditCardSchema,
  ExecutePaypalPaymentSchema,
  PaymentSchema,
  StagePaypalPaymentSchema } from './account.schema';

type Page<T> = Linode.ResourcePage<T>;

interface Paypal {
  cancel_url: string;
  redirect_url: string;
  usd: string;
}

interface ExecutePayload {
  payer_id: string;
  payment_id: string;
}

interface SaveCreditCardData {
  card_number: string,
  expiry_year: number,
  expiry_month: number
}

interface PaymentID {
  payment_id: string;
}

/**
 * getPayments
 *
 * Retrieve a paginated list of the most recent payments made
 * on your account.
 *
 */
export const getPayments = (params?: any, filter?: any) =>
  Request<Page<Linode.Payment>>(
    setURL(`${API_ROOT}/account/payments`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  )

/**
 * makePayment
 *
 * Make a payment using the currently active credit card on your
 * account.
 *
 * @param data { object }
 * @param data.usd { string } the dollar amount of the payment
 * @param data.CVV { string } the 3-digit code on the back of the
 * credit card.
 *
 */
export const makePayment = (data: { usd: string, CVV?: string }) =>
  Request<Linode.Payment>(
    setURL(`${API_ROOT}/account/payments`),
    setMethod('POST'),
    setData(data, PaymentSchema),
  )

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
  Request<PaymentID>(
    setURL(`${API_ROOT}/account/payments/paypal`),
    setMethod('POST'),
    setData(data, StagePaypalPaymentSchema),
  )


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
  Request<{}>(
    setURL(`${API_ROOT}/account/payments/paypal/execute`),
    setMethod('POST'),
    setData(data, ExecutePaypalPaymentSchema),
  )

/**
 * saveCreditCard
 *
 * Add or update credit card information to your account. Only one
 * card is allowed per account, so this method will overwrite any
 * existing information.
 *
 */
export const saveCreditCard = (data: SaveCreditCardData) => Request<{}>(
  setURL(`${API_ROOT}/account/credit-card`),
  setMethod('POST'),
  setData(data, CreditCardSchema),
)
import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setParams, setURL, setXFilter } from 'src/services';

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

export const getPayments = (pagination: Linode.PaginationOptions = {}) =>
  Request<Page<Linode.Payment>>(
    setURL(`${API_ROOT}/account/payments`),
    setMethod('GET'),
    setParams(pagination),
    setXFilter({ '+order_by': 'date', '+order': 'desc' }),
  )
    .then(response => response.data);

export const makePayment = (data: { usd: string, ccv: string }) =>
  Request<Linode.Payment>(
    setURL(`${API_ROOT}/account/payments`),
    setMethod('POST'),
    setData(data),
  )
    .then(response => response.data)

export const stagePaypalPayment = (data: Paypal) =>
  Request<PaymentID>(
    setURL(`${API_ROOT}/account/payments/paypal`),
    setMethod('POST'),
    setData(data),
  )
    .then(response => response.data);

export const executePaypalPayment = (data: ExecutePayload) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/payments/paypal/execute`),
    setMethod('POST'),
    setData(data),
  )
    .then(response => response.data);


export const saveCreditCard = (data: SaveCreditCardData) => Request<{}>(
  setURL(`${API_ROOT}/account/credit-card`),
  setMethod('POST'),
  setData(data),
)
  .then(response => response.data);
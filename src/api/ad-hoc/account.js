import { fetch } from '../fetch';
import { actions } from '../generic/account';

export function transferPool() {
  return async (dispatch) => {
    const _transferpool = await dispatch(fetch.get('/account/transfer'));
    dispatch(actions.one({ _transferpool }, 0));
  };
}

/**
 * A deviated /payment POST caller because the parameters
 * differ from the generic /payments GET response fields.
 * The API expects strings for these numeric values.
 * @param {number} amount
 * @param {number} cvv
 */
export function makePayment(amount, cvv) {
  return (dispatch) => dispatch(fetch.post('/account/payments', {
    usd: `${amount.toFixed(2)}`,
    cvv: cvv ? `${parseInt(cvv)}` : undefined,
  }));
}

export function updateCard(body) {
  return (dispatch) => dispatch(fetch.post('/account/credit-card', body));
}

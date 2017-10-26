import { fetch } from '../fetch';
import { actions } from '../generic/account';

export function transferPool() {
  return async (dispatch) => {
    const _transferpool = await dispatch(fetch.get('/account/transfer'));
    dispatch(actions.one({ _transferpool }, 0));
  };
}

export function makePayment(amount) {
  return (dispatch) => dispatch(fetch.post('/account/payments', {
    usd: `${amount.toFixed(2)}`,
  }));
}

export function updateCard(body) {
  return (dispatch) => dispatch(fetch.post('/account/credit-card', body));
}

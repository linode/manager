import { fetch } from '../fetch';
import { actions } from '../generic/account';

export function transferPool() {
  return async (dispatch) => {
    const _transferpool = await dispatch(fetch.get('/account/transfer'));
    dispatch(actions.one({ _transferpool }, 0));
  };
}

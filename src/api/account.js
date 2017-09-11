import { thunkFetch } from './apiActionReducerGenerator';
import { actions } from './configs/account';


export function transferPool() {
  return async (dispatch) => {
    const _transferpool = await dispatch(
      thunkFetch.get('/account/transfer')
    );
    dispatch(actions.one({ _transferpool }, 0));
  };
}

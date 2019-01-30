import { getAccountInfo } from 'src/services/account';
import { ThunkActionCreator } from 'src/store/types';
import {
  profileRequest,
  profileRequestFail,
  profileRequestSuccess
} from './account.actions';

/**
 * Async
 */
export const requestAccount: ThunkActionCreator<
  Promise<Linode.Account>
> = () => (dispatch, getStore) => {
  dispatch(profileRequest());
  return getAccountInfo()
    .then(response => {
      dispatch(profileRequestSuccess(response));
      return response;
    })
    .catch(err => {
      dispatch(profileRequestFail(err));
      return err;
    });
};

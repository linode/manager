import { compose } from 'redux';

import { getAccountSettings, updateAccountSettings as _update } from 'src/services/account';
import { ThunkActionCreator } from '../types';
import { handleError, handleSuccess, handleUpdate, handleUpdateError, startRequest } from './accountSettings.actions';

export const requestAccountSettings: ThunkActionCreator<void> = () => (dispatch) => {
  dispatch(startRequest());
  getAccountSettings()
    .then(compose(dispatch, handleSuccess))
    .catch(compose(dispatch, handleError));
};

export const updateAccountSettings: ThunkActionCreator<void> = (data: Partial<Linode.AccountSettings>) => (dispatch) => {
  _update(data)
    .then(compose(dispatch, handleUpdate))
    .catch(compose(dispatch, handleUpdateError));
}
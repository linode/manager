import {
  AccountSettings,
  getAccountSettings,
  updateAccountSettings as _update
} from 'linode-js-sdk/lib/account'
import { compose } from 'redux';

import { ThunkActionCreator } from '../types';
import {
  handleError,
  handleSuccess,
  handleUpdate,
  handleUpdateError,
  startRequest
} from './accountSettings.actions';

export const requestAccountSettings: ThunkActionCreator<
  Promise<AccountSettings>
> = () => dispatch => {
  dispatch(startRequest());
  return getAccountSettings()
    .then(response => {
      compose(
        dispatch,
        handleSuccess
      )(response);
      return response;
    })
    .catch(error => {
      compose(
        dispatch,
        handleError
      )(error);
      return error;
    });
};

export const updateAccountSettings: ThunkActionCreator<void> = (
  data: Partial<AccountSettings>
) => dispatch => {
  _update(data)
    .then(
      compose(
        dispatch,
        handleUpdate
      )
    )
    .catch(
      compose(
        dispatch,
        handleUpdateError
      )
    );
};

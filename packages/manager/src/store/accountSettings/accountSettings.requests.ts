import { compose } from 'redux';

import {
  getAccountSettings,
  updateAccountSettings as _update
} from 'src/services/account';
import { ThunkActionCreator } from '../types';
import {
  handleError,
  handleSuccess,
  handleUpdate,
  handleUpdateError,
  startRequest
} from './accountSettings.actions';

export const requestAccountSettings: ThunkActionCreator<
  Promise<Linode.AccountSettings>
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
  data: Partial<Linode.AccountSettings>
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

import {
  getUserPreferences as _getUserPreferences,
  updateUserPreferences as _updateUserPreferences
} from 'linode-js-sdk/lib/profile';
import { ThunkActionCreator } from 'src/store/types';
import {
  handleGetPreferences,
  handleUpdatePreferences
} from './preferences.actions';

export const getUserPreferences: ThunkActionCreator<
  Promise<Record<string, any>>
> = () => dispatch => {
  const { started, done, failed } = handleGetPreferences;

  dispatch(started());

  return _getUserPreferences()
    .then(response => {
      dispatch(
        done({
          result: response
        })
      );
      return response;
    })
    .catch(error => {
      dispatch(
        failed({
          error
        })
      );
      throw error;
    });
};

export const updateUserPreferences: ThunkActionCreator<
  Promise<Record<string, any>>
> = (payload: Record<string, any>) => dispatch => {
  const { started, done, failed } = handleUpdatePreferences;

  dispatch(
    started({
      params: payload
    })
  );

  return _updateUserPreferences(payload)
    .then(response => {
      dispatch(
        done({
          params: payload,
          result: response
        })
      );
      return response;
    })
    .catch(error => {
      dispatch(
        failed({
          params: payload,
          error
        })
      );
      throw error;
    });
};

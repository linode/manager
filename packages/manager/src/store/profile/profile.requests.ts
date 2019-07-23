import { pathOr } from 'ramda';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ActionCreator, Failure, Success } from 'typescript-fsa';

import {
  getMyGrants,
  getProfile,
  updateProfile as _updateProfile
} from 'src/services/profile';
import { ApplicationState } from 'src/store';
import { ThunkActionCreator } from 'src/store/types';
import { getProfileActions, handleUpdateProfile } from './profile.actions';

const maybeRequestGrants: (
  response: Linode.Profile
) => Promise<Linode.Profile> = profile => {
  if (profile.restricted === false) {
    return Promise.resolve(profile);
  }

  return getMyGrants().then(grants => ({ ...profile, grants }));
};

export const getTimezone = (state: ApplicationState, timezone: string) => {
  const isLoggedInAsCustomer = pathOr(
    false,
    ['authentication', 'loggedInAsCustomer'],
    state
  );
  /** If logged in as customer (from Admin), use the browser's local time instead of the
   *  value in profile. Otherwise, use the user's chosen value.
   */
  return isLoggedInAsCustomer
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : timezone;
};

export const requestProfile: ThunkActionCreator<
  Promise<Linode.Profile>
> = () => (dispatch, getState) => {
  const { started, done, failed } = getProfileActions;

  dispatch(started());

  return getProfile()
    .then(profile => ({
      ...profile.data,
      timezone: getTimezone(getState(), profile.data.timezone)
    }))
    .then(maybeRequestGrants)
    .then(response => {
      dispatch(done({ result: response }));
      return response;
    })
    .catch(error => {
      dispatch(failed({ error }));
      throw error;
    });
};

/**
 * @todo this doesn't let you update grants
 */
export const updateProfile: ThunkActionCreator<
  Promise<Partial<Linode.Profile>>
> = (payload: Partial<Linode.Profile>) => dispatch => {
  const { done, failed } = handleUpdateProfile;

  /**
   * intentionally not setting loading state here. We're going to keep that
   * at the component level
   */

  return _updateProfile(payload)
    .then(response => handleUpdateSuccess(payload, response, done, dispatch))
    .catch(err => handleUpdateFailure(payload, err, failed, dispatch));
};

const handleUpdateSuccess = (
  payload: Partial<Linode.Profile>,
  result: Partial<Linode.Profile>,
  done: ActionCreator<
    Success<Partial<Linode.Profile>, Partial<Linode.Profile>>
  >,
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  dispatch(
    done({
      params: payload,
      result
    })
  );
  return result;
};

const handleUpdateFailure = (
  payload: Partial<Linode.Profile>,
  error: Linode.ApiFieldError[],
  failed: ActionCreator<
    Failure<Partial<Linode.Profile>, Linode.ApiFieldError[]>
  >,
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  dispatch(
    failed({
      params: payload,
      error
    })
  );
  throw error;
};

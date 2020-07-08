import {
  getMyGrants,
  getProfile,
  Profile,
  updateProfile as _updateProfile
} from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { pathOr } from 'ramda';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ActionCreator, Failure, Success } from 'typescript-fsa';

import { ApplicationState } from 'src/store';
import { ThunkActionCreator } from 'src/store/types';
import { getProfileActions, handleUpdateProfile } from './profile.actions';

const maybeRequestGrants: (
  response: Profile
) => Promise<Profile> | Profile = profile => {
  if (profile.restricted === false) {
    return profile;
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

export const requestProfile: ThunkActionCreator<Promise<Profile>> = () => (
  dispatch,
  getState
) => {
  const { started, done, failed } = getProfileActions;

  dispatch(started());

  return getProfile()
    .then(profile => ({
      ...profile,
      timezone: getTimezone(getState(), profile.timezone)
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
  Promise<Profile>,
  Partial<Profile>
> = payload => dispatch => {
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
  payload: Partial<Profile>,
  result: Profile,
  done: ActionCreator<Success<Partial<Profile>, Partial<Profile>>>,
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
  payload: Partial<Profile>,
  error: APIError[],
  failed: ActionCreator<Failure<Partial<Profile>, APIError[]>>,
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

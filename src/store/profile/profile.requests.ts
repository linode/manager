import { pathOr } from 'ramda';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ActionCreator, Failure, Success } from 'typescript-fsa';

import {
  getMyGrants,
  getProfile,
  getUserPreferences,
  updateProfile as _updateProfile,
  updateUserPreferences
} from 'src/services/profile';
import { ApplicationState } from 'src/store';
import { ThunkActionCreator } from 'src/store/types';
import {
  getProfileActions,
  handleUpdateProfile,
  ProfileWithPreferences
} from './profile.actions';

const maybeRequestGrants: (
  response: ProfileWithPreferences
) => Promise<ProfileWithPreferences> = profile => {
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
  Promise<ProfileWithPreferences>
> = () => (dispatch, getState) => {
  const { started, done, failed } = getProfileActions;

  dispatch(started());

  return Promise.all([getProfile(), getUserPreferences()])
    .then(([profile, userPrefs]) => ({
      ...profile.data,
      preferences: userPrefs
    }))
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
      return error;
    });
};

/**
 * @todo this doesn't let you update grants
 */
export const updateProfile: ThunkActionCreator<
  Promise<Partial<ProfileWithPreferences>>
> = (payload: Partial<ProfileWithPreferences>) => dispatch => {
  const { done, failed } = handleUpdateProfile;

  /**
   * intentionally not setting loading state here. We're going to keep that
   * at the component level
   */

  if (!!payload.preferences) {
    return updateProfileAndPreferences(payload as ProfileWithPreferences)
      .then(([profile, preferences]) => {
        return handleUpdateSuccess(
          payload,
          {
            ...profile,
            preferences
          },
          done,
          dispatch
        );
      })
      .catch(error => {
        return handleUpdateFailure(payload, error, failed, dispatch);
      });
  }

  return _updateProfile(payload)
    .then(response => handleUpdateSuccess(payload, response, done, dispatch))
    .catch(err => handleUpdateFailure(payload, err, failed, dispatch));
};

const updateProfileAndPreferences = (payload: ProfileWithPreferences) => {
  return Promise.all([
    _updateProfile(payload),
    updateUserPreferences(payload.preferences)
  ]);
};

const handleUpdateSuccess = (
  payload: Partial<ProfileWithPreferences>,
  result: Partial<ProfileWithPreferences>,
  done: ActionCreator<
    Success<Partial<ProfileWithPreferences>, Partial<ProfileWithPreferences>>
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
  payload: Partial<ProfileWithPreferences>,
  error: Linode.ApiFieldError[],
  failed: ActionCreator<
    Failure<Partial<ProfileWithPreferences>, Linode.ApiFieldError[]>
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

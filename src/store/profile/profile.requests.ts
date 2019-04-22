import { pathOr } from 'ramda';
import { getMyGrants, getProfile } from 'src/services/profile';
import { ApplicationState } from 'src/store';
import { ThunkActionCreator } from 'src/store/types';
import { getProfileActions } from './profile.actions';

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
    .then(response => response.data)
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

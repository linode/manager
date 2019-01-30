import { getMyGrants, getProfile } from 'src/services/profile';
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

export const requestProfile: ThunkActionCreator<
  Promise<Linode.Profile>
> = () => dispatch => {
  const { started, done, failed } = getProfileActions;

  dispatch(started());

  return getProfile()
    .then(response => response.data)
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

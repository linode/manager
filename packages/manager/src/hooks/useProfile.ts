import { Profile } from '@linode/api-v4/lib/profile/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/profile/profile.reducer';
import {
  requestProfile as _request,
  updateProfile as _update,
} from 'src/store/profile/profile.requests';
import { Dispatch } from './types';

export interface ProfileProps {
  profile: State;
  requestProfile: () => Promise<Profile>;
  updateProfile: (payload: Partial<Profile>) => Promise<Profile>;
}

export const useProfile = () => {
  const dispatch: Dispatch = useDispatch();
  const profile = useSelector(
    (state: ApplicationState) => state.__resources.profile
  );
  const requestProfile = () => dispatch(_request());
  const updateProfile = (payload: Partial<Profile>) =>
    dispatch(_update(payload));

  return { profile, requestProfile, updateProfile };
};

export default useProfile;

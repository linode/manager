import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

import { ProfileWithPreferences } from 'src/store/profile/profile.actions';
import { State } from 'src/store/profile/profile.reducer';
import {
  requestProfile,
  updateProfile
} from 'src/store/profile/profile.requests';

import { ThunkDispatch } from 'src/store/types';

export interface ProfileActionsProps {
  getProfile: () => Promise<ProfileWithPreferences>;
  updateProfile: (
    params: Partial<ProfileWithPreferences>
  ) => Promise<ProfileWithPreferences>;
}

export default <TInner extends {}, TOuter extends {}>(
  mapAccountToProps: (ownProps: TOuter, profile: State) => TInner
) =>
  connect(
    (state: ApplicationState, ownProps: TOuter) => {
      return mapAccountToProps(ownProps, state.__resources.profile);
    },
    (dispatch: ThunkDispatch) => ({
      getProfile: () => dispatch(requestProfile()),
      updateProfile: (payload: Partial<ProfileWithPreferences>) =>
        dispatch(updateProfile(payload))
    })
  );

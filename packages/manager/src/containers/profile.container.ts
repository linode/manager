import { Profile } from 'linode-js-sdk/lib/profile'
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

import { State } from 'src/store/profile/profile.reducer';
import {
  requestProfile,
  updateProfile
} from 'src/store/profile/profile.requests';

import { ThunkDispatch } from 'src/store/types';

export interface ProfileActionsProps {
  getProfile: () => Promise<Profile>;
  updateProfile: (params: Partial<Profile>) => Promise<Profile>;
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
      updateProfile: (payload: Partial<Profile>) =>
        dispatch(updateProfile(payload))
    })
  );

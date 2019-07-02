import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

import { State } from 'src/store/profile/profile.reducer';
import {
  requestProfile,
  updateProfile
} from 'src/store/profile/profile.requests';

import { ThunkDispatch } from 'src/store/types';

export interface ProfileActionsProps {
  getProfile: () => Promise<Linode.Profile>;
  updateProfile: (params: Partial<Linode.Profile>) => Promise<Linode.Profile>;
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
      updateProfile: (payload: Partial<Linode.Profile>) =>
        dispatch(updateProfile(payload))
    })
  );

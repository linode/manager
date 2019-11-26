import { Profile } from 'linode-js-sdk/lib/profile';
import { connect, InferableComponentEnhancerWithProps } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/profile/profile.reducer';
import {
  requestProfile,
  updateProfile
} from 'src/store/profile/profile.requests';
import { ThunkDispatch } from 'src/store/types';

export interface DispatchProps {
  getProfile: () => Promise<Profile>;
  updateProfile: (params: Partial<Profile>) => Promise<Profile>;
}

export interface StateProps {
  profileError: State['error'];
  profileLoading: State['loading'];
  profileData: State['data'];
  profileLastUpdated: State['lastUpdated'];
}

type MapProps<ReduxStateProps, OwnProps> = (
  ownProps: OwnProps,
  data: State
) => ReduxStateProps & Partial<StateProps>;

export type Props = DispatchProps & StateProps;

interface Connected {
  <ReduxStateProps, OwnProps>(
    mapStateToProps: MapProps<ReduxStateProps, OwnProps>
  ): InferableComponentEnhancerWithProps<
    ReduxStateProps & Partial<StateProps> & DispatchProps & OwnProps,
    OwnProps
  >;
  <ReduxStateProps, OwnProps>(): InferableComponentEnhancerWithProps<
    ReduxStateProps & DispatchProps & OwnProps,
    OwnProps
  >;
}

const connected: Connected = <ReduxState extends {}, OwnProps extends {}>(
  mapStateToProps?: MapProps<ReduxState, OwnProps>
) =>
  connect<
    (ReduxState & Partial<StateProps>) | StateProps,
    DispatchProps,
    OwnProps,
    ApplicationState
  >(
    (state, ownProps) => {
      const {
        lastUpdated: profileLastUpdated,
        loading: profileLoading,
        error: profileError,
        data: profileData
      } = state.__resources.profile;

      /** @todo name the arguments profileLoading, profileError, etc */
      if (mapStateToProps) {
        return mapStateToProps(ownProps, state.__resources.profile);
      }

      return {
        profileData,
        profileError,
        profileLastUpdated,
        profileLoading
      };
    },
    (dispatch: ThunkDispatch) => ({
      getProfile: () => dispatch(requestProfile()),
      updateProfile: profile => dispatch(updateProfile(profile))
    })
  );

export default connected;

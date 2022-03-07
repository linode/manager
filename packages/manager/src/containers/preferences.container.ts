import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

import { UserPreferences } from 'src/store/preferences/preferences.actions';
import { State } from 'src/store/preferences/preferences.reducer';
import {
  getUserPreferences,
  updateUserPreferences,
} from 'src/store/preferences/preferences.requests';

import { ThunkDispatch } from 'src/store/types';

export interface PreferencesStateProps {
  preferences: UserPreferences;
}

export interface PreferencesActionsProps {
  getUserPreferences: () => Promise<UserPreferences>;
  updateUserPreferences: (params: UserPreferences) => Promise<UserPreferences>;
}

export type Props = PreferencesActionsProps & PreferencesStateProps;

export default <TInner extends {}, TOuter extends {}>(
  mapAccountToProps?: (ownProps: TOuter, profile: State) => TInner
) =>
  connect(
    (state: ApplicationState, ownProps: TOuter) => {
      if (mapAccountToProps) {
        return mapAccountToProps(ownProps, state.preferences);
      }
      return { preferences: state.preferences.data ?? {} };
    },
    (dispatch: ThunkDispatch) => ({
      getUserPreferences: () => dispatch(getUserPreferences()),
      updateUserPreferences: (payload: UserPreferences) =>
        dispatch(updateUserPreferences(payload)),
    })
  );

import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

import { State } from 'src/store/preferences/preferences.reducer';
import {
  getUserPreferences,
  updateUserPreferences
} from 'src/store/preferences/preferences.requests';

import { ThunkDispatch } from 'src/store/types';

export interface PreferencesActionsProps {
  getUserPreferences: () => Promise<Record<string, any>>;
  updateUserPreferences: (
    params: Record<string, any>
  ) => Promise<Record<string, any>>;
}

export default <TInner extends {}, TOuter extends {}>(
  mapAccountToProps: (ownProps: TOuter, profile: State) => TInner
) =>
  connect(
    (state: ApplicationState, ownProps: TOuter) => {
      return mapAccountToProps(ownProps, state.preferences);
    },
    (dispatch: ThunkDispatch) => ({
      getUserPreferences: () => dispatch(getUserPreferences()),
      updateUserPreferences: (payload: Partial<Linode.Profile>) =>
        dispatch(updateUserPreferences(payload))
    })
  );

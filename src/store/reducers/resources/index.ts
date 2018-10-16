import { combineReducers } from "redux";

import accountSettings, { DEFAULT_STATE  as defaultAccountSettingsState } from './accountSettings';
import profile, { DEFAULT_STATE as defaultProfileState } from './profile';

export const defaultState = {
  accountSettings: defaultAccountSettingsState,
  profile: defaultProfileState,
}

export default combineReducers({ accountSettings, profile });

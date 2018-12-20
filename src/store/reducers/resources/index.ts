import { combineReducers } from "redux";

import account, { DEFAULT_STATE  as defaultAccountState } from './account';
import accountSettings, { DEFAULT_STATE  as defaultAccountSettingsState } from './accountSettings';
import profile, { DEFAULT_STATE as defaultProfileState } from './profile';

export const defaultState = {
  accountSettings: defaultAccountSettingsState,
  profile: defaultProfileState,
  account: defaultAccountState,
}

export default combineReducers({ account, accountSettings, profile });

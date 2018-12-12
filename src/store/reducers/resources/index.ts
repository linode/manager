import { combineReducers } from "redux";
import accountSettings, { DEFAULT_STATE as defaultAccountSettingsState } from './accountSettings';
import linodes, { defaultState as defaultLinodesState } from './linodes';
import profile, { DEFAULT_STATE as defaultProfileState } from './profile';
import types, { defaultState as defaultTypesState } from './types';


export const defaultState = {
  accountSettings: defaultAccountSettingsState,
  profile: defaultProfileState,
  linodes: defaultLinodesState,
  types: defaultTypesState,
}

export default combineReducers({ accountSettings, profile, linodes, types });

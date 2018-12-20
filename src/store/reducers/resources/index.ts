import { combineReducers } from "redux";
import { DEFAULT_STATE as defaultAccountState } from './account';
import accountSettings, { DEFAULT_STATE as defaultAccountSettingsState } from './accountSettings';
import domains, { defaultState as defaultDomainsState } from './domains';
import linodes, { defaultState as defaultLinodesState } from './linodes';
import profile, { DEFAULT_STATE as defaultProfileState } from './profile';
import types, { defaultState as defaultTypesState } from './types';

export const defaultState = {
  account: defaultAccountState,
  accountSettings: defaultAccountSettingsState,
  domains: defaultDomainsState,
  linodes: defaultLinodesState,
  profile: defaultProfileState,
  types: defaultTypesState,
}

export default combineReducers({ accountSettings, profile, domains, linodes, types });

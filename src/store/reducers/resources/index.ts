import { combineReducers } from "redux";
import domains, { defaultState as defaultDomainsState } from '../../domains/domains.reducer';
import accountSettings, { DEFAULT_STATE as defaultAccountSettingsState } from './accountSettings';
import images, { defaultState as defaultImagesState } from './images';
import linodes, { defaultState as defaultLinodesState } from './linodes';
import profile, { DEFAULT_STATE as defaultProfileState } from './profile';
import types, { defaultState as defaultTypesState } from './types';


export const defaultState = {
  accountSettings: defaultAccountSettingsState,
  profile: defaultProfileState,
  domains: defaultDomainsState,
  linodes: defaultLinodesState,
  types: defaultTypesState,
  images: defaultImagesState,
}

export default combineReducers({ accountSettings, profile, domains, linodes, types, images });

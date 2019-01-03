import { combineReducers } from "redux";
import linodes, { defaultState as defaultLinodesState } from 'src/store/linodes/linodes.reducer';
import domains, { defaultState as defaultDomainsState } from '../../domains/domains.reducer';
import { defaultState as volumesDefaultState, reducer as volumes  } from '../../volumes';
import account, { DEFAULT_STATE as defaultAccountState } from './account';
import accountSettings, { DEFAULT_STATE as defaultAccountSettingsState } from './accountSettings';
import images, { defaultState as defaultImagesState } from './images';
import profile, { DEFAULT_STATE as defaultProfileState } from './profile';
import types, { defaultState as defaultTypesState } from './types';

export const defaultState = {
  account: defaultAccountState,
  accountSettings: defaultAccountSettingsState,
  domains: defaultDomainsState,
  linodes: defaultLinodesState,
  profile: defaultProfileState,
  types: defaultTypesState,
  images: defaultImagesState,
  volumes: volumesDefaultState,
}

export default combineReducers({
  account,
  accountSettings,
  profile,
  domains,
  linodes,
  types,
  images,
  volumes
});

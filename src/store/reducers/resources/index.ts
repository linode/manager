import { combineReducers } from "redux";
import regions, { defaultState as defaultRegionsState } from 'src/store/regions/regions.reducer';
import domains, { defaultState as defaultDomainsState } from '../../domains/domains.reducer';
import account, { DEFAULT_STATE as defaultAccountState } from './account';
import accountSettings, { DEFAULT_STATE as defaultAccountSettingsState } from './accountSettings';
import images, { defaultState as defaultImagesState } from './images';
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
  images: defaultImagesState,
  regions: defaultRegionsState,
}

export default combineReducers({ account, accountSettings, profile, domains, linodes, types, images, regions });

import { combineReducers } from "redux";
import linodes, { defaultState as defaultLinodesState } from 'src/store/linodes/linodes.reducer';
import regions, { defaultState as defaultRegionsState } from 'src/store/regions/regions.reducer';
import domains, { defaultState as defaultDomainsState } from '../../domains/domains.reducer';
import account, { DEFAULT_STATE as defaultAccountState } from './account';
import accountSettings, { DEFAULT_STATE as defaultAccountSettingsState } from './accountSettings';
import images, { defaultState as defaultImagesState } from './images';
import profile, { DEFAULT_STATE as defaultProfileState } from './profile';
import types, { defaultState as defaultTypesState } from './types';

export const defaultState = {
  account: defaultAccountState,
  accountSettings: defaultAccountSettingsState,
  domains: defaultDomainsState,
  images: defaultImagesState,
  linodes: defaultLinodesState,
  profile: defaultProfileState,
  regions: defaultRegionsState,
  types: defaultTypesState,
}

export default combineReducers({ account, accountSettings, profile, domains, linodes, types, images, regions });

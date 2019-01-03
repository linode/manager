import { combineReducers } from "redux";
import { defaultState as volumesDefaultState, reducer as volumes  } from '../../volumes';
import accountSettings, { DEFAULT_STATE as defaultAccountSettingsState } from './accountSettings';
import domains, { defaultState as defaultDomainsState } from './domains';
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
  volumes: volumesDefaultState,
}

export default combineReducers({
  accountSettings,
  profile,
  domains,
  linodes,
  types,
  images,
  volumes
});

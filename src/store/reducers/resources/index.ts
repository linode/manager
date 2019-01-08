import { combineReducers } from "redux";
import linodes, { defaultState as defaultLinodesState } from 'src/store/linodes/linodes.reducer';
import nodeBalancers, { defaultState as defaultNodeBalancersState } from 'src/store/nodeBalancers/nodeBalancers.reducer';
import volumes, { defaultState as defaultVolumesState } from 'src/store/volumes/volumes.reducer';
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
  nodeBalancers: defaultNodeBalancersState,
  profile: defaultProfileState,
  types: defaultTypesState,
  volumes: defaultVolumesState,
}

export default combineReducers({
  account,
  accountSettings,
  domains,
  images,
  linodes,
  nodeBalancers,
  profile,
  types,
  volumes,
});

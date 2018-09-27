import { combineReducers } from 'redux';

import disks, { defaultState as defaultDisksState } from './disks';
import volumes, { defaultState as defaultVolumesState } from './volumes';

export const defaultState = {
  volumes: defaultVolumesState,
  disks: defaultDisksState,
};

export default combineReducers({
  disks,
  volumes,
});

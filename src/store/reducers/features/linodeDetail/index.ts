import { combineReducers } from 'redux';

import volumes, { defaultState as defaultVolumesState } from './volumes';

export const defaultState = {
  volumes: defaultVolumesState
};

export default combineReducers({
  volumes
});

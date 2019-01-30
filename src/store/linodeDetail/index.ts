import { combineReducers } from 'redux';
import disks, {
  defaultState as defaultDisksState,
  State as LinodeDisksState
} from './disks';
import volumes, {
  defaultState as defaultVolumesState,
  State as LinodeVolumesState
} from './volumes';

export interface State {
  disks: LinodeDisksState;
  volumes: LinodeVolumesState;
}

export const defaultState = {
  disks: defaultDisksState,
  volumes: defaultVolumesState
};

export default combineReducers({
  disks,
  volumes
});

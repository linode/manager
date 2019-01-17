import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { createDefaultState, onCreateOrUpdate, onError, onGetAllSuccess, onStart } from "../store.helpers";
import { createVolumeActions, getAllVolumesActions, updateVolumeActions } from './volume.actions';

type State = ApplicationState['__resources']['volumes'];

export const defaultState: State = createDefaultState<Linode.Volume>();

const reducer: Reducer<State> = (state = defaultState, action) => {

  /*
  * Create Volume
  **/
  if (isType(action, createVolumeActions.done)) {
    const { result: volume } = action.payload;
    return onCreateOrUpdate<Linode.Volume>(volume, state)
  }

  if (isType(action, createVolumeActions.failed)) {
    const { error } = action.payload;
    return onError(error, state)
  }

  /*
  * Update Volume
  **/
  if (isType(action, updateVolumeActions.done)) {
    const { result: volume } = action.payload;
    return onCreateOrUpdate<Linode.Volume>(volume, state)
  }

  if (isType(action, updateVolumeActions.failed)) {
    const { error } = action.payload;
    return onError(error, state)
  }

  /*
  * Get All Volumes
  **/
  if (isType(action, getAllVolumesActions.started)) {
    return onStart(state);
  }

  if (isType(action, getAllVolumesActions.done)) {
    const { result } = action.payload;
    return onGetAllSuccess(result, state);
  }

  if (isType(action, getAllVolumesActions.failed)) {
    const { error } = action.payload;
    return onError(error, state)
  }

  return state;
}

export default reducer;
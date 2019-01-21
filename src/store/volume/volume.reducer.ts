import { Reducer } from 'redux';
import { MappedEntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import { createDefaultState, onCreateOrUpdate, onDeleteSuccess, onError, onGetAllSuccess, onStart } from '../store.helpers';
import { attachVolumeActions, cloneVolumeActions, createVolumeActions, deleteVolumeActions, detachVolumeActions, getAllVolumesActions, getOneVolumeActions, resizeVolumeActions, updateVolumeActions, updateVolumeStatus } from './volume.actions';

export type State = MappedEntityState<Linode.Volume>;

export const defaultState: State = createDefaultState<Linode.Volume>();

const reducer: Reducer<State> = (state = defaultState, action) => {

  /*
  * Create Volume
  **/
  if (isType(action, createVolumeActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate<Linode.Volume>(result, state)
  }
  if (isType(action, createVolumeActions.failed)) {
    const { error } = action.payload;
    return onError(error, state)
  }

  /*
  * Update Volume
  **/
  if (isType(action, updateVolumeActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate<Linode.Volume>(result, state)
  }
  if (isType(action, updateVolumeActions.failed)) {
    const { error } = action.payload;
    return onError(error, state)
  }

  /*
  * Delete Volume
  **/
  if (isType(action, deleteVolumeActions.done)) {
    const { params } = action.payload;
    return onDeleteSuccess<Linode.Volume>(params.volumeId, state)
  }
  if (isType(action, deleteVolumeActions.failed)) {
    const { error } = action.payload;
    return onError(error, state)
  }

  /*
  * Attach Volume
  */
  if (isType(action, attachVolumeActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate<Linode.Volume>(result, state)
  }
  /*
  * Detach Volume
  */
  if (isType(action, detachVolumeActions.done)) {
    const { volumeId } = action.payload.params;
    const { itemsById } = state;
    return {
      ...state,
      itemsById: {
        ...itemsById,
        [volumeId]: {
          ...itemsById[volumeId],
          linode_id: null
        }
      }
    };
  }

  /*
  * Clone Volume
  */
  if (isType(action, cloneVolumeActions.done)) {
    const { result } = action.payload;

    // When we send a POST to clone a volume, we get back a 200 with the new volume as JSON. The status will be
    // "creating", since it takes some time to clone a volume. There's a problem: the event notification that we will
    // get back in a few seconds from the API won't include the new volume. The status will at this point still be
    // "creating" most likely, and WE WILL NOT GET ANOTHER EVENT WHEN THE STATUS IS ACTIVE.
    //
    // Therefore, we will have a volume that is stuck in a "creating" state until the next request to get all volumes.
    //
    // We don't know how long this will take, so we can't simply delay a request to get all volumes from the time the
    // cloning notification event comes through. So, at this point, we will choose to hardcode the status as "active"
    // once a POST to clone a volume is successful.
    //
    // THIS IS NOT IDEAL, AND SHOULD BE IMPROVED!
    const hardcodedStatus: Linode.VolumeStatus = 'active';
    const resultHardcodedWithActiveStatus = { ...result, status: hardcodedStatus }

    return onCreateOrUpdate<Linode.Volume>(resultHardcodedWithActiveStatus, state)
  }

  /*
  * Resize Volume
  */
  if (isType(action, resizeVolumeActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate<Linode.Volume>(result, state);
  }

  /*
  * Get One Volume
  */
  if (isType(action, getOneVolumeActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate<Linode.Volume>(result, state);
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

  /*
  * Update Volume Status
  */
  if (isType(action, updateVolumeStatus)) {
    const { volumeId, status } = action.payload;
    const { itemsById } = state;

    return {
      ...state,
      itemsById: {
        ...itemsById,
        [volumeId]: {
          ...itemsById[volumeId],
          status
        }
      }
    }
  }

  return state;
}

export default reducer;

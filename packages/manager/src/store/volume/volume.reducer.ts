import { Volume } from '@linode/api-v4/lib/volumes';
import { pathOr } from 'ramda';
import { Reducer } from 'redux';
import { MappedEntityState2 as MappedEntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import {
  addMany,
  createDefaultState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart,
} from '../store.helpers.tmp';
import {
  createVolumeActions,
  deleteVolumeActions,
  getAllVolumesActions,
  getOneVolumeActions,
  getVolumesPageActions,
  updateVolumeActions,
} from './volume.actions';

import { EntityError } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

export type State = MappedEntityState<Volume, EntityError>;

export const defaultState: State = createDefaultState<Volume, EntityError>({
  error: {
    create: undefined,
    update: undefined,
    delete: undefined,
    read: undefined,
  },
});

const reducer: Reducer<State> = (state = defaultState, action) => {
  /*
   * Create Volume
   **/
  if (isType(action, createVolumeActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate<Volume, EntityError>(result, state);
  }
  if (isType(action, createVolumeActions.failed)) {
    const { error } = action.payload;
    return onError<MappedEntityState<Volume, EntityError>, EntityError>(
      {
        create: getAPIErrorOrDefault(error),
      },
      state
    );
  }

  /*
   * Update Volume
   **/
  if (isType(action, updateVolumeActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate<Volume, EntityError>(result, state);
  }
  if (isType(action, updateVolumeActions.failed)) {
    const { error } = action.payload;
    return onError<MappedEntityState<Volume, EntityError>, EntityError>(
      {
        update: getAPIErrorOrDefault(error),
      },
      state
    );
  }

  /*
   * Delete Volume
   **/
  if (isType(action, deleteVolumeActions.done)) {
    const { params } = action.payload;
    return onDeleteSuccess<Volume, EntityError>(params.volumeId, state);
  }
  if (isType(action, deleteVolumeActions.failed)) {
    const { error } = action.payload;
    return onError<MappedEntityState<Volume, EntityError>, EntityError>(
      {
        delete: getAPIErrorOrDefault(error),
      },
      state
    );
  }

  /*
   * Get One Volume
   */
  if (isType(action, getOneVolumeActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate<Volume, EntityError>(result, state);
  }

  /*
   * Get All Volumes
   **/
  if (isType(action, getAllVolumesActions.started)) {
    const shouldSetLoading = pathOr(true, ['payload', 'setLoading'], action);
    if (shouldSetLoading) {
      return onStart<MappedEntityState<Volume, EntityError>>(state);
    }
  }
  if (isType(action, getAllVolumesActions.done)) {
    const { result } = action.payload;
    return onGetAllSuccess<Volume, MappedEntityState<Volume, EntityError>>(
      result.data,
      state,
      result.results
    );
  }
  if (isType(action, getAllVolumesActions.failed)) {
    const { error } = action.payload;
    return onError<MappedEntityState<Volume, EntityError>, EntityError>(
      {
        read: getAPIErrorOrDefault(error),
      },
      state
    );
  }

  if (isType(action, getVolumesPageActions.started)) {
    return state;
  }

  if (isType(action, getVolumesPageActions.done)) {
    const { result } = action.payload;
    /**
     * NOTE: getPage actions shouldn't update lastUpdated,
     * since they don't constitute a full update to the store.
     *
     * We rely on this quirk to determine if we have full data
     * for this entity type in the store or if we should request it.
     *
     * However, if a single request with page_size 25 is enough to
     * return all the Volumes data, then there is no need to getAll()
     * anywhere else, so long as the data is not stale. In other words,
     * if result.results === result.data.length, we *do* want to update
     * lastUpdated so that additional requests aren't made.
     *
     */
    const isFullRequest = result.results === result.data.length;
    const newState = addMany(result.data, state, result.results);
    return isFullRequest ? { ...newState, lastUpdated: Date.now() } : newState;
  }

  if (isType(action, getVolumesPageActions.failed)) {
    return state; // Probably shouldn't return an error state here.
  }

  return state;
};

export default reducer;

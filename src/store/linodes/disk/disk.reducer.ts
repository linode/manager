import { Reducer } from 'redux';
import {
  addMany,
  createDefaultState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart,
  removeMany
} from 'src/store/store.helpers';
import { MappedEntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import { deleteLinode, deleteLinodeActions } from '../linodes.actions';
import {
  createLinodeDiskActions,
  deleteLinodeDiskActions,
  getAllLinodeDisksActions,
  getLinodeDiskActions,
  getLinodeDisksActions,
  updateLinodeDiskActions
} from './disk.actions';
import { Entity } from './disk.types';

export type State = MappedEntityState<Entity>;

export const defaultState: State = createDefaultState<Entity>();

const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, deleteLinodeActions.done)) {
    const {
      params: { linodeId }
    } = action.payload;

    const configIdsToRemove = Object.values(state.itemsById)
      .filter(({ linode_id }) => linode_id === linodeId)
      .map(({ id }) => String(id));

    return removeMany(configIdsToRemove, state);
  }

  if (isType(action, deleteLinode)) {
    const { payload } = action;

    const configIdsToRemove = Object.values(state.itemsById)
      .filter(({ linode_id }) => linode_id === payload)
      .map(({ id }) => String(id));

    return removeMany(configIdsToRemove, state);
  }

  if (isType(action, getLinodeDisksActions.done)) {
    const { result } = action.payload;
    return addMany(result, state);
  }

  if (isType(action, createLinodeDiskActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, getLinodeDiskActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, updateLinodeDiskActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, deleteLinodeDiskActions.done)) {
    const {
      params: { diskId: DiskId }
    } = action.payload;

    return onDeleteSuccess(DiskId, state);
  }

  /**
   * reset error state when our request to disks has started and
   * or a request to get one disk has started
   */
  if (
    isType(action, getAllLinodeDisksActions.started) ||
    isType(action, getLinodeDiskActions.started)
  ) {
    return onStart(state);
  }

  if (isType(action, getAllLinodeDisksActions.done)) {
    const { result } = action.payload;
    return onGetAllSuccess(result, state);
  }

  if (isType(action, getAllLinodeDisksActions.failed)) {
    const { error } = action.payload;
    return onError(error, state);
  }

  return state;
};

export default reducer;

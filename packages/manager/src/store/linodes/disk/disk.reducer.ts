import produce from 'immer';
import { Reducer } from 'redux';
import {
  addMany,
  ensureInitializedNestedState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart,
  removeMany
} from 'src/store/store.helpers';
import { EntityError, MappedEntityState } from 'src/store/types';
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

export type State = Record<number, MappedEntityState<Entity, EntityError>>;

export const defaultState: State = {};

const reducer: Reducer<State> = (state = defaultState, action) => {
  return produce(state, draft => {
    if (isType(action, deleteLinodeActions.done)) {
      const {
        params: { linodeId }
      } = action.payload;

      delete draft[linodeId];
    }

    if (isType(action, deleteLinode)) {
      const { payload } = action;
      const linodeId = action.payload;

      const configIdsToRemove = Object.values(state[linodeId]?.itemsById ?? {})
        .filter(({ linode_id }) => linode_id === payload)
        .map(({ id }) => String(id));

      // @todo: Should this actually just remove the key from state?
      draft[linodeId] = removeMany(configIdsToRemove, state[linodeId]);
    }

    if (isType(action, getLinodeDisksActions.done)) {
      const { result } = action.payload;
      const { linodeId } = action.payload.params;
      draft[linodeId].loading = false;
      draft[linodeId] = addMany(result, draft[linodeId]);
    }

    if (
      isType(action, createLinodeDiskActions.done) ||
      isType(action, getLinodeDiskActions.done) ||
      isType(action, updateLinodeDiskActions.done)
    ) {
      const { result } = action.payload;
      const { linodeId } = action.payload.params;

      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId].loading = false;
      draft[linodeId] = onCreateOrUpdate(result, draft[linodeId]);
    }

    if (isType(action, deleteLinodeDiskActions.started)) {
      const { linodeId } = action.payload;
      draft[linodeId] = onError<
        MappedEntityState<Entity, EntityError>,
        EntityError
      >(
        {
          delete: undefined
        },
        state[linodeId]
      );
    }

    if (isType(action, deleteLinodeDiskActions.done)) {
      const {
        params: { diskId: DiskId, linodeId }
      } = action.payload;
      draft[linodeId] = onDeleteSuccess(DiskId, state[linodeId]);
    }

    /**
     * reset error state when our request to disks has started and
     * or a request to get one disk has started
     */
    if (
      isType(action, getAllLinodeDisksActions.started) ||
      isType(action, getLinodeDiskActions.started)
    ) {
      const { linodeId } = action.payload;
      draft[linodeId] = onStart(state[linodeId]);
    }

    if (isType(action, getAllLinodeDisksActions.done)) {
      const { result } = action.payload;
      const { linodeId } = action.payload.params;
      draft[linodeId] = onGetAllSuccess(result, state[linodeId]);
    }

    if (isType(action, getAllLinodeDisksActions.failed)) {
      const { error } = action.payload;
      const { linodeId } = action.payload.params;

      draft[linodeId] = onError<
        MappedEntityState<Entity, EntityError>,
        EntityError
      >(
        {
          read: error
        },
        state[linodeId]
      );
    }
  });
};

export default reducer;

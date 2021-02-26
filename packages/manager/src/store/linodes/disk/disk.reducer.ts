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
} from 'src/store/store.helpers.tmp';
import {
  EntityError,
  MappedEntityState2 as MappedEntityState,
} from 'src/store/types';
import { isType } from 'typescript-fsa';
import { deleteLinode, deleteLinodeActions } from '../linodes.actions';
import {
  createLinodeDiskActions,
  deleteLinodeDiskActions,
  getAllLinodeDisksActions,
  getLinodeDiskActions,
  getLinodeDisksActions,
  updateLinodeDiskActions,
} from './disk.actions';
import { Entity } from './disk.types';

export type State = Record<number, MappedEntityState<Entity, EntityError>>;

export const defaultState: State = {};

const reducer: Reducer<State> = (state = defaultState, action) =>
  produce(state, draft => {
    // getLinodeDiskActions
    // getAllLinodeDiskActions
    if (
      isType(action, getLinodeDiskActions.started) ||
      isType(action, getAllLinodeDisksActions.started)
    ) {
      const { linodeId } = action.payload;
      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId] = onStart(draft[linodeId]);
    }

    if (isType(action, getLinodeDisksActions.done)) {
      const { result } = action.payload;
      const { linodeId } = action.payload.params;
      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId].loading = false;
      draft[linodeId] = addMany(result.data, draft[linodeId], result.results);
    }

    if (isType(action, getAllLinodeDisksActions.done)) {
      const { result } = action.payload;
      const { linodeId } = action.payload.params;
      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId] = onGetAllSuccess(
        result.data,
        draft[linodeId],
        result.results
      );
    }

    if (isType(action, getAllLinodeDisksActions.failed)) {
      const { error } = action.payload;
      const { linodeId } = action.payload.params;

      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId] = onError<
        MappedEntityState<Entity, EntityError>,
        EntityError
      >(
        {
          read: error,
        },
        draft[linodeId]
      );
    }

    // createLinodeDiskActions
    // getLinodeDiskActions
    // updateLinodeDiskActions
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

    // deleteLinodeDiskActions
    if (isType(action, deleteLinodeDiskActions.started)) {
      const { linodeId } = action.payload;
      draft = ensureInitializedNestedState(draft, linodeId);
      draft[linodeId].error = { ...draft[linodeId].error, delete: undefined };
    }

    if (isType(action, deleteLinodeDiskActions.done)) {
      const {
        params: { diskId: DiskId, linodeId },
      } = action.payload;
      draft = ensureInitializedNestedState(draft, linodeId);
      draft[linodeId] = onDeleteSuccess(DiskId, draft[linodeId]);
    }

    // deleteLinode (sync – used to respond to events)
    // deleteLinodeActions (async – used when a delete Linode request is made)
    //
    // The reducer result is the same, but these need to be two code blocks
    // because the linodeId is located in different places between the actions.
    if (isType(action, deleteLinode)) {
      const linodeId = action.payload;
      delete draft[linodeId];
    }

    if (isType(action, deleteLinodeActions.done)) {
      const {
        params: { linodeId },
      } = action.payload;

      delete draft[linodeId];
    }
  });

export default reducer;

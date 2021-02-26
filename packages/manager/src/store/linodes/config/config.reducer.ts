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
import { EntityError, RelationalMappedEntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import { deleteLinode, deleteLinodeActions } from '../linodes.actions';
import {
  createLinodeConfigActions,
  deleteLinodeConfigActions,
  getAllLinodeConfigsActions,
  getLinodeConfigActions,
  getLinodeConfigsPageActions,
  updateLinodeConfigActions,
} from './config.actions';
import { Entity } from './config.types';

export type State = RelationalMappedEntityState<Entity, EntityError>;

export const defaultState: State = {};

const reducer: Reducer<State> = (state = defaultState, action) =>
  produce(state, draft => {
    // getLinodeConfigActions
    // getAllLinodeConfigActions
    if (
      isType(action, getLinodeConfigActions.started) ||
      isType(action, getLinodeConfigsPageActions.started) ||
      isType(action, getAllLinodeConfigsActions.started)
    ) {
      const { linodeId } = action.payload;
      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId] = onStart(draft[linodeId]);
    }

    if (isType(action, getLinodeConfigsPageActions.done)) {
      const { result } = action.payload;
      const { linodeId } = action.payload.params;
      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId].loading = false;
      draft[linodeId] = addMany(result.data, draft[linodeId], result.results);
    }

    if (isType(action, getAllLinodeConfigsActions.done)) {
      const { result } = action.payload;
      const { linodeId } = action.payload.params;
      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId] = onGetAllSuccess(
        result.data,
        draft[linodeId],
        result.results
      );
    }

    if (isType(action, getAllLinodeConfigsActions.failed)) {
      const { error } = action.payload;
      const { linodeId } = action.payload.params;

      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId] = onError(
        {
          read: error,
        },
        draft[linodeId]
      );
    }

    // createLinodeConfigActions
    // getLinodeConfigActions
    // updateLinodeConfigActions
    if (
      isType(action, createLinodeConfigActions.done) ||
      isType(action, getLinodeConfigActions.done) ||
      isType(action, updateLinodeConfigActions.done)
    ) {
      const { result } = action.payload;
      const { linodeId } = action.payload.params;
      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId].loading = false;
      draft[linodeId] = onCreateOrUpdate(result, draft[linodeId]);
    }

    // deleteLinodeConfigActions
    if (isType(action, deleteLinodeConfigActions.started)) {
      const { linodeId } = action.payload;
      draft = ensureInitializedNestedState(draft, linodeId);
      draft[linodeId].error = {
        ...draft[linodeId].error,
        delete: undefined,
      };
    }

    if (isType(action, deleteLinodeConfigActions.done)) {
      const {
        params: { configId, linodeId },
      } = action.payload;
      draft = ensureInitializedNestedState(draft, linodeId);
      draft[linodeId] = onDeleteSuccess(configId, draft[linodeId]);
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

import produce from 'immer';
import { Reducer } from 'redux';
import {
  addMany,
  ensureInitializedNestedState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart
} from 'src/store/store.helpers.tmp';
import {
  EntityError,
  MappedEntityState2 as MappedEntityState
} from 'src/store/types';
import { isType } from 'typescript-fsa';
import { deleteLinode, deleteLinodeActions } from '../linodes.actions';
import {
  getLinodeInterfacesActions,
  getAllLinodeInterfacesActions,
  getLinodeInterfaceActions,
  createLinodeInterfaceActions,
  deleteLinodeInterfaceActions
} from './interfaces.actions';
import { LinodeInterface } from '@linode/api-v4/lib/linodes';

export type State = Record<
  number,
  MappedEntityState<LinodeInterface, EntityError>
>;

export const defaultState: State = {};

const reducer: Reducer<State> = (state = defaultState, action) =>
  produce(state, draft => {
    // getLinodeInterfacesActions
    // getAllLinodeInterfacesActions
    if (
      isType(action, getLinodeInterfacesActions.started) ||
      isType(action, getAllLinodeInterfacesActions.started)
    ) {
      const { linodeId } = action.payload;
      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId] = onStart(draft[linodeId]);
    }

    if (isType(action, getLinodeInterfacesActions.done)) {
      const { result } = action.payload;
      const { linodeId } = action.payload.params;
      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId].loading = false;
      draft[linodeId] = addMany(result.data, draft[linodeId], result.results);
    }

    if (isType(action, getAllLinodeInterfacesActions.done)) {
      const { result } = action.payload;
      const { linodeId } = action.payload.params;
      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId] = onGetAllSuccess(
        result.data,
        draft[linodeId],
        result.results
      );
    }

    if (isType(action, getAllLinodeInterfacesActions.failed)) {
      const { error } = action.payload;
      const { linodeId } = action.payload.params;

      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId] = onError<
        MappedEntityState<LinodeInterface, EntityError>,
        EntityError
      >(
        {
          read: error
        },
        draft[linodeId]
      );
    }

    // getLinodeInterfaceActions
    // createLinodeInterfaceActions
    if (
      isType(action, getLinodeInterfaceActions.done) ||
      isType(action, createLinodeInterfaceActions.done)
    ) {
      const { result } = action.payload;
      const { linodeId } = action.payload.params;
      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId].loading = false;
      draft[linodeId] = onCreateOrUpdate(result, draft[linodeId]);
    }

    // deleteLinodeInterfaceActions
    if (isType(action, deleteLinodeInterfaceActions.started)) {
      const { linodeId } = action.payload;
      draft = ensureInitializedNestedState(draft, linodeId);
      draft[linodeId].error = { ...draft[linodeId].error, delete: undefined };
    }

    if (isType(action, deleteLinodeInterfaceActions.done)) {
      const {
        params: { interfaceId: InterfaceId, linodeId }
      } = action.payload;
      draft = ensureInitializedNestedState(draft, linodeId);
      draft[linodeId] = onDeleteSuccess(InterfaceId, draft[linodeId]);
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
        params: { linodeId }
      } = action.payload;

      delete draft[linodeId];
    }
  });

export default reducer;

import { LinodeInterface } from '@linode/api-v4/lib/linodes';
import produce from 'immer';
import { Reducer } from 'redux';
import {
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
import {
  createLinodeInterfaceActions,
  deleteLinodeInterfaceActions,
  getAllLinodeInterfacesActions,
  getLinodeInterfaceActions,
} from './interfaces.actions';

export type State = Record<
  number,
  MappedEntityState<LinodeInterface, EntityError>
>;

export const defaultState: State = {};

const reducer: Reducer<State> = (state = defaultState, action) =>
  produce(state, (draft) => {
    // getAllLinodeInterfacesActions
    if (isType(action, getAllLinodeInterfacesActions.started)) {
      const { linodeId } = action.payload;
      draft = ensureInitializedNestedState(draft, linodeId);

      draft[linodeId] = onStart(draft[linodeId]);
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
          read: error,
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
        params: { interfaceId: InterfaceId, linodeId },
      } = action.payload;
      draft = ensureInitializedNestedState(draft, linodeId);
      draft[linodeId] = onDeleteSuccess(InterfaceId, draft[linodeId]);
    }
  });

export default reducer;

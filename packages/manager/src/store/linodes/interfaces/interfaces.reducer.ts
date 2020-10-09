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
import {
  LinodeInterface,
  LinodeInterfacePayload
} from '@linode/api-v4/lib/linodes';

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
    }

    if (isType(action, getLinodeInterfacesActions.done)) {
    }

    if (isType(action, getAllLinodeInterfacesActions.done)) {
    }
  });

export default reducer;

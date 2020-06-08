import { Reducer } from 'redux';
import {
  addMany,
  createDefaultState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart
} from 'src/store/store.helpers.tmp';
import { EntityError, MappedEntityState2 } from 'src/store/types';
import { isType } from 'typescript-fsa';
import {
  createLinodeActions,
  deleteLinode,
  deleteLinodeActions,
  getLinodesActions,
  updateLinodeActions,
  updateMultipleLinodes,
  upsertLinode
} from './linodes.actions';

import { LinodeWithMaintenanceAndDisplayStatus } from './types';

/**
 * State
 */
export type State = MappedEntityState2<
  LinodeWithMaintenanceAndDisplayStatus,
  EntityError
>;

export const defaultState: State = createDefaultState();

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  /** Get ALL */
  if (isType(action, getLinodesActions.started)) {
    return onStart(state);
  }

  if (isType(action, getLinodesActions.done)) {
    const {
      payload: { result }
    } = action;
    return onGetAllSuccess(result.data, state, result.results);
  }

  if (isType(action, getLinodesActions.failed)) {
    const { error } = action.payload;

    return onError(
      {
        read: error
      },
      state
    );
  }

  if (isType(action, upsertLinode)) {
    const { payload } = action;
    return onCreateOrUpdate(payload, state);
  }

  if (isType(action, updateMultipleLinodes)) {
    const { payload } = action; /** list of successfully updated Linodes */
    if (payload && payload.length === 0) {
      return state;
    }
    return addMany(payload, state);
  }

  if (isType(action, deleteLinode)) {
    const { payload } = action;
    return onDeleteSuccess(payload, state);
  }

  if (isType(action, updateLinodeActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, createLinodeActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, deleteLinodeActions.done)) {
    const {
      params: { linodeId }
    } = action.payload;
    return onDeleteSuccess(linodeId, state);
  }

  return state;
};

export default reducer;

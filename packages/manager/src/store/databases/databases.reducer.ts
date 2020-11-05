import { Database, DatabaseType } from '@linode/api-v4/lib/databases';
import { Reducer } from 'redux';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import { isType } from 'typescript-fsa';
import {
  createDefaultState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart,
  setError
} from '../store.helpers.tmp';
import { MappedEntityState2 as MappedEntityState } from '../types';
import {
  createDatabaseActions,
  deleteDatabaseActions,
  getDatabasesActions,
  updateDatabaseActions
} from './databases.actions';

export type State = MappedEntityState<Database>;

export const defaultState: State = createDefaultState();

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, getDatabasesActions.started)) {
    return onStart(state);
  }

  if (isType(action, getDatabasesActions.done)) {
    const { result } = action.payload;
    return onGetAllSuccess(result.data, state, result.results);
  }

  if (isType(action, getDatabasesActions.failed)) {
    const { error } = action.payload;

    return onError({ read: error }, state);
  }

  if (isType(action, createDatabaseActions.started)) {
    return setError({ create: undefined }, state);
  }

  if (isType(action, createDatabaseActions.done)) {
    const newDatabase = action.payload.result;
    return onCreateOrUpdate(newDatabase, state);
  }

  if (isType(action, createDatabaseActions.failed)) {
    const { error } = action.payload;

    return onError({ create: error }, state);
  }

  if (isType(action, deleteDatabaseActions.started)) {
    return setError({ delete: undefined }, state);
  }

  if (isType(action, deleteDatabaseActions.done)) {
    const { databaseID } = action.payload.params;
    return onDeleteSuccess(databaseID, state);
  }

  if (isType(action, deleteDatabaseActions.failed)) {
    const { error } = action.payload;

    return onError({ delete: error }, state);
  }

  if (isType(action, updateDatabaseActions.started)) {
    return setError({ update: undefined }, state);
  }

  if (isType(action, updateDatabaseActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, updateDatabaseActions.failed)) {
    const { error } = action.payload;

    return onError({ update: error }, state);
  }

  return state;
};

export interface ExtendedType extends DatabaseType {
  heading: string;
  subHeadings: [string, string];
}

export const extendType = (type: DatabaseType): ExtendedType => {
  const {
    label,
    memory,
    vcpus,
    disk,
    price: { monthly, hourly }
  } = type;
  return {
    ...type,
    heading: label,
    subHeadings: [
      `$${monthly}/mo ($${hourly}/hr)`,
      typeLabelDetails(memory, disk, vcpus)
    ] as [string, string]
  };
};

export default reducer;

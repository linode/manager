import { ManagedServiceMonitor } from '@linode/api-v4/lib/managed';
import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';

import {
  EntityError,
  MappedEntityState2 as MappedEntityState,
} from 'src/store/types';
import {
  createDefaultState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart,
  setError,
} from 'src/store/store.helpers.tmp';

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  createServiceMonitorActions,
  deleteServiceMonitorActions,
  disableServiceMonitorActions,
  enableServiceMonitorActions,
  requestServicesActions,
  updateServiceMonitorActions,
} from './managed.actions';

/**
 * State
 */

export type State = MappedEntityState<ManagedServiceMonitor, EntityError>;

export const defaultState: State = createDefaultState();
/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, requestServicesActions.done)) {
    const { result } = action.payload;

    return onGetAllSuccess(result.data, state, result.results);
  }

  if (isType(action, requestServicesActions.started)) {
    return onStart(state);
  }

  if (isType(action, requestServicesActions.failed)) {
    const { error } = action.payload;

    return onError(
      { read: getAPIErrorOrDefault(error, 'Error loading your Monitors.') },
      state
    );
  }

  if (
    isType(action, disableServiceMonitorActions.started) ||
    isType(action, enableServiceMonitorActions.started)
  ) {
    return setError({ update: undefined }, state);
  }

  if (
    isType(action, disableServiceMonitorActions.done) ||
    isType(action, enableServiceMonitorActions.done)
  ) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (
    isType(action, disableServiceMonitorActions.failed) ||
    isType(action, enableServiceMonitorActions.failed)
  ) {
    const { error } = action.payload;
    return onError({ update: error }, state);
  }

  if (isType(action, createServiceMonitorActions.started)) {
    return setError({ create: undefined }, state);
  }

  if (isType(action, createServiceMonitorActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, createServiceMonitorActions.failed)) {
    const { error } = action.payload;
    return onError({ create: error }, state);
  }

  if (isType(action, deleteServiceMonitorActions.started)) {
    return setError({ delete: undefined }, state);
  }

  if (isType(action, deleteServiceMonitorActions.done)) {
    const {
      params: { monitorID },
    } = action.payload;
    return onDeleteSuccess(monitorID, state);
  }

  if (isType(action, deleteServiceMonitorActions.failed)) {
    const { error } = action.payload;
    return onError({ delete: error }, state);
  }

  if (isType(action, updateServiceMonitorActions.started)) {
    return setError({ update: undefined }, state);
  }

  if (isType(action, updateServiceMonitorActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, updateServiceMonitorActions.failed)) {
    const { error } = action.payload;
    return onError({ update: error }, state);
  }
  return state;
};

export default reducer;

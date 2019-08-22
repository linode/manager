import produce from 'immer';
import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';

import { EntityError, EntityState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import updateOrAdd from 'src/utilities/updateOrAdd';
import {
  createServiceMonitorActions,
  deleteServiceMonitorActions,
  disableServiceMonitorActions,
  enableServiceMonitorActions,
  updateServiceMonitorActions,
  requestServicesActions
} from './managed.actions';

/**
 * State
 */

export type State = EntityState<Linode.ManagedServiceMonitor, EntityError>;

export const defaultState: State = {
  results: [],
  entities: [],
  loading: false,
  lastUpdated: 0,
  error: {}
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  return produce(state, draft => {
    if (isType(action, requestServicesActions.done)) {
      const { result } = action.payload;

      draft.entities = result;
      draft.results = result.map(s => s.id);
      draft.loading = false;
      draft.lastUpdated = Date.now();
    }

    if (isType(action, requestServicesActions.started)) {
      draft.loading = true;
    }

    if (isType(action, requestServicesActions.failed)) {
      const { error } = action.payload;

      draft.loading = false;
      draft.error!.read = getAPIErrorOrDefault(
        error,
        'Error loading your Monitors.'
      );
    }

    if (
      isType(action, disableServiceMonitorActions.started) ||
      isType(action, enableServiceMonitorActions.started)
    ) {
      draft.error!.update = undefined;
    }

    if (
      isType(action, disableServiceMonitorActions.done) ||
      isType(action, enableServiceMonitorActions.done)
    ) {
      const { result } = action.payload;
      draft.entities = updateOrAdd(result, state.entities);
      draft.results = draft.entities.map(m => m.id);
    }

    if (
      isType(action, disableServiceMonitorActions.failed) ||
      isType(action, enableServiceMonitorActions.failed)
    ) {
      const { error } = action.payload;
      draft.error!.update = error;
    }

    if (isType(action, createServiceMonitorActions.started)) {
      draft.error!.create = undefined;
    }

    if (isType(action, createServiceMonitorActions.done)) {
      const { result } = action.payload;
      draft.entities.push(result);
      draft.results.push(result.id);
    }

    if (isType(action, createServiceMonitorActions.failed)) {
      const { error } = action.payload;
      draft.error!.create = error;
    }

    if (isType(action, deleteServiceMonitorActions.started)) {
      draft.error!.delete = undefined;
    }

    if (isType(action, deleteServiceMonitorActions.done)) {
      const { params: monitor } = action.payload;
      draft.entities = state.entities.filter(
        thisMonitor => thisMonitor.id !== monitor.monitorID
      );
      draft.results = draft.entities.map(m => m.id);
    }

    if (isType(action, deleteServiceMonitorActions.failed)) {
      const { error } = action.payload;
      draft.error!.delete = error;
    }

    if (isType(action, updateServiceMonitorActions.started)) {
      draft.error!.update = undefined;
    }

    if (isType(action, updateServiceMonitorActions.done)) {
      const { result } = action.payload;
      draft.entities = updateOrAdd(result, state.entities);
      draft.results = draft.entities.map(m => m.id);
      draft.lastUpdated = Date.now();
    }
    
    if (isType(action, updateServiceMonitorActions.failed)) {
      const { error } = action.payload;
      draft.error!.update = error;
    }

    return draft;
  });
};

export default reducer;

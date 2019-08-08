import produce from 'immer';
import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';

import { EntityError, EntityState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { requestServicesActions } from './managed.actions';

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
    return draft;
  });
};

export default reducer;

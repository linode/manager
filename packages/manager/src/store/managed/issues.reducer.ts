import produce from 'immer';
import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';

import { EntityError, EntityState } from 'src/store/types';
import { ExtendedIssue, requestManagedIssuesActions } from './issues.actions';

/**
 * State
 */

export type State = EntityState<ExtendedIssue, EntityError>;

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
    if (isType(action, requestManagedIssuesActions.started)) {
      draft.loading = true;
      draft.error!.read = undefined;
    }

    if (isType(action, requestManagedIssuesActions.done)) {
      const { result } = action.payload;
      draft.loading = false;
      draft.entities = result;
      draft.results = result.map(i => i.id);
      draft.lastUpdated = Date.now();
    }

    if (isType(action, requestManagedIssuesActions.failed)) {
      const { error } = action.payload;
      draft.loading = false;
      draft.error!.read = error;
    }

    return draft;
  });
};

export default reducer;

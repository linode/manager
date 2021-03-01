import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';

import {
  createDefaultState,
  onError,
  onGetAllSuccess,
  onStart,
} from 'src/store/store.helpers.tmp';
import {
  EntityError,
  MappedEntityState2 as MappedEntityState,
} from 'src/store/types';
import { ExtendedIssue, requestManagedIssuesActions } from './issues.actions';

/**
 * State
 */

export type State = MappedEntityState<ExtendedIssue, EntityError>;

export const defaultState: State = createDefaultState();

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, requestManagedIssuesActions.started)) {
    return onStart(state);
  }

  if (isType(action, requestManagedIssuesActions.done)) {
    const { result } = action.payload;
    return onGetAllSuccess(result.data, state, result.results);
  }

  if (isType(action, requestManagedIssuesActions.failed)) {
    const { error } = action.payload;
    return onError({ read: error }, state);
  }

  return state;
};

export default reducer;

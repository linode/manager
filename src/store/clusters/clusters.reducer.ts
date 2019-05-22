import { Reducer } from 'redux';
import { EntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import { clustersRequestActions } from './clusters.actions';

/**
 * State
 */
export type State = EntityState<Linode.Cluster>;

export const defaultState: State = {
  results: [],
  entities: [],
  loading: true,
  lastUpdated: 0,
  error: undefined
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, clustersRequestActions.started)) {
    return {
      ...state,
      loading: true
    };
  }

  if (isType(action, clustersRequestActions.done)) {
    const { result } = action.payload;

    return {
      ...state,
      loading: false,
      lastUpdated: Date.now(),
      entities: result,
      results: result.map(r => r.id),
      error: undefined
    };
  }

  if (isType(action, clustersRequestActions.failed)) {
    const { error } = action.payload;

    return {
      ...state,
      loading: false,
      error
    };
  }

  return state;
};

export default reducer;

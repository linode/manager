import { Reducer } from 'redux';
import { EntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import { regionsRequestActions } from './regions.actions';

/**
 * State
 */
export type State = EntityState<Linode.Region>;

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
  if (isType(action, regionsRequestActions.started)) {
    return {
      ...state,
      loading: true
    };
  }

  if (isType(action, regionsRequestActions.done)) {
    const { result } = action.payload;

    return {
      ...state,
      loading: false,
      lastUpdated: Date.now(),
      entities: result,
      results: result.map(r => r.id)
    };
  }

  if (isType(action, regionsRequestActions.failed)) {
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

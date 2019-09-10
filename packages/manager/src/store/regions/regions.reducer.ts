import { Region } from 'linode-js-sdk/lib/regions';
import { Reducer } from 'redux';
import { EntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import { regionsRequestActions } from './regions.actions';

/**
 * State
 */
export type State = EntityState<Region>;

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
  return produce(state, draft => {
    if (isType(action, regionsRequestActions.started)) {
      draft.loading = true;
    }
  
    if (isType(action, regionsRequestActions.done)) {
      const { result } = action.payload;
  
      draft.loading = false;
      draft.lastUpdated = Date.now();
      draft.entities = result;
      draft.results = result.map(r => r.id);
    }
  
    if (isType(action, regionsRequestActions.failed)) {
      const { error } = action.payload;
  
      draft.loading = false;
      draft.error = error;
    }
  })
};

export default reducer;

import { Region } from '@linode/api-v4/lib/regions';
import produce from 'immer';
import { Reducer } from 'redux';
import regions from 'src/cachedData/regions.json';
import { EntityState } from 'src/store/types';
import { isProdAPI } from 'src/utilities/isProdApi';
import { isType } from 'typescript-fsa';
import { regionsRequestActions } from './regions.actions';

/**
 * State
 */
export type State = EntityState<Region>;

/**
 * If we're in an environment talking to the production API,
 * and if we have cached regions data available,
 * use that as our default.
 */
export const defaultState: State = {
  results: isProdAPI() ? regions?.data?.map((r) => r.id) ?? [] : [],
  entities: isProdAPI() ? (regions?.data as Region[]) ?? [] : [],
  loading: true,
  lastUpdated: 0,
  error: undefined,
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  return produce(state, (draft) => {
    if (isType(action, regionsRequestActions.started)) {
      draft.loading = true;
    }

    if (isType(action, regionsRequestActions.done)) {
      const { result } = action.payload;
      draft.loading = false;
      draft.lastUpdated = Date.now();
      draft.entities = result;
      draft.results = result.map((r) => r.id);
    }

    if (isType(action, regionsRequestActions.failed)) {
      const { error } = action.payload;

      draft.loading = false;
      draft.error = error;
    }
  });
};

export default reducer;

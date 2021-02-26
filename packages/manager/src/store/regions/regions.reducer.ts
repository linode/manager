import produce from 'immer';
import { Capabilities, Region, RegionStatus } from '@linode/api-v4/lib/regions';
import { Reducer } from 'redux';
import regions from 'src/cachedData/regions.json';
import { isProdAPI } from 'src/constants';
import { EntityState } from 'src/store/types';
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
  results: isProdAPI ? regions?.data?.map(r => r.id) ?? [] : [],
  entities: isProdAPI ? (regions?.data as Region[]) ?? [] : [],
  loading: true,
  lastUpdated: 0,
  error: undefined,
};

/**
 * For display purposes only, a disabled
 * version of the us-southeast region that
 * is otherwise not returned by the API.
 */
const fakeAtlanta = {
  id: 'us-southeast',
  country: 'us',
  capabilities: ['Linodes', 'NodeBalancers'] as Capabilities[],
  status: 'ok' as RegionStatus,
  resolvers: {
    ipv4:
      '173.230.129.5,173.230.136.5,173.230.140.5,66.228.59.5,66.228.62.5,50.116.35.5,50.116.41.5,23.239.18.5',
    ipv6: '',
  },
  disabled: true,
  display: 'Atlanta, GA',
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
      /**
       * If the API response includes us-southeast (Atlanta),
       * they can access the datacenter normally and there's nothing for us to do.
       * If it doesn't come back, we want to show a disabled Atlanta option in the select
       * with messaging and a link to the relevant blog post, so that users aren't
       * confused by the sudden, temporary disappearance of a region.
       */
      draft.entities = result.some(
        thisRegion => thisRegion.id === 'us-southeast'
      )
        ? result
        : [...result, fakeAtlanta];
      draft.results = result.map(r => r.id);
    }

    if (isType(action, regionsRequestActions.failed)) {
      const { error } = action.payload;

      draft.loading = false;
      draft.error = error;
    }
  });
};

export default reducer;

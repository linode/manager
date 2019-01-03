import { Reducer } from 'redux';
import updateOrAdd from 'src/utilities/updateOrAdd';
import { isType } from 'typescript-fsa';
import { deleteDomain, getDomainsFailure, getDomainsRequest, getDomainsSuccess, upsertDomain } from './domains.actions';
import { entitiesFromPayload, resultsFromPayload } from './domains.helpers';

/**
 * State
 */
type State = ApplicationState['__resources']['domains'];

export const defaultState: State = {
  results: [],
  entities: [],
  loading: true,
  lastUpdated: 0,
  error: undefined,
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, getDomainsRequest)) {
    return {
      ...state,
      loading: true,
    };
  }

  if (isType(action, getDomainsSuccess)) {
    const { payload } = action;
    return {
      ...state,
      entities: entitiesFromPayload(payload),
      results: resultsFromPayload(payload),
      lastUpdated: Date.now(),
      loading: false,
    };
  }

  if (isType(action, getDomainsFailure)) {
    const { payload } = action;
    return {
      ...state,
      error: payload,
      loading: false,
    };
  }

  if (isType(action, upsertDomain)) {
    const { payload } = action;
    const updated = updateOrAdd(payload, state.entities);

    return {
      ...state,
      entities: updated,
      results: updated.map((domain) => domain.id),
    }
  }

  if (isType(action, deleteDomain)) {
    const { payload } = action;
    const { entities, results } = state;

    return {
      ...state,
      entities: entities.filter((domain) => domain.id !== payload),
      results: results.filter((id) => id !== payload),
    }
  }

  return state
};

export default reducer;

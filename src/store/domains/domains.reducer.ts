import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { addDomain, deleteDomain, getDomainsFailure, getDomainsRequest, getDomainsSuccess, updateDomain } from './domains.actions';
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

  if (isType(action, updateDomain)) {
    const { payload } = action;
    return {
      ...state,
      entities: state.entities.map((domain) => domain.id === payload.id ? payload : domain),
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

  if (isType(action, addDomain)) {
    const { payload } = action;
    const { entities, results } = state;
    return {
      ...state,
      entities: [...entities, payload],
      results: [...results, payload.id],
    }
  }

  return state
};

export default reducer;

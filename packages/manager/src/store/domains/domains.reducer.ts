import { Reducer } from 'redux';
import { EntityState } from 'src/store/types';
import updateOrAdd from 'src/utilities/updateOrAdd';
import { isType } from 'typescript-fsa';
import {
  createDomainActions,
  deleteDomain,
  deleteDomainActions,
  getDomainsFailure,
  getDomainsRequest,
  getDomainsSuccess,
  updateDomainActions,
  upsertDomain
} from './domains.actions';
import { entitiesFromPayload, resultsFromPayload } from './domains.helpers';

/**
 * State
 */

export type State = EntityState<Linode.Domain>;

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
  if (isType(action, getDomainsRequest)) {
    return {
      ...state,
      loading: true
    };
  }

  if (isType(action, getDomainsSuccess)) {
    const { payload } = action;
    return {
      ...state,
      entities: entitiesFromPayload(payload),
      results: resultsFromPayload(payload),
      lastUpdated: Date.now(),
      loading: false
    };
  }

  if (isType(action, getDomainsFailure)) {
    const { payload } = action;
    return {
      ...state,
      error: payload,
      loading: false
    };
  }

  if (isType(action, upsertDomain)) {
    const { payload } = action;
    const updated = updateOrAdd(payload, state.entities);

    return {
      ...state,
      entities: updated,
      results: updated.map(domain => domain.id)
    };
  }

  if (isType(action, deleteDomain)) {
    const { payload } = action;
    const { entities, results } = state;

    return {
      ...state,
      entities: entities.filter(domain => domain.id !== payload),
      results: results.filter(id => id !== payload)
    };
  }

  if (isType(action, createDomainActions.done)) {
    const { result } = action.payload;
    const updated = updateOrAdd(result, state.entities);

    return {
      ...state,
      entities: updated,
      results: updated.map(domain => domain.id)
    };
  }

  if (isType(action, updateDomainActions.done)) {
    const { result } = action.payload;
    const updated = updateOrAdd(result, state.entities);

    return {
      ...state,
      entities: updated,
      results: updated.map(domain => domain.id)
    };
  }

  if (isType(action, deleteDomainActions.done)) {
    const { domainId } = action.payload.params;
    const { entities, results } = state;

    return {
      ...state,
      entities: entities.filter(domain => domain.id !== domainId),
      results: results.filter(id => id !== domainId)
    };
  }

  return state;
};

export default reducer;

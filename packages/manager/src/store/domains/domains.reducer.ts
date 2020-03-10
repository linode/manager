import { Domain } from 'linode-js-sdk/lib/domains';
import { Reducer } from 'redux';
import { RequestableDataWithEntityError } from 'src/store/types';
import updateOrAdd from 'src/utilities/updateOrAdd';
import { isType } from 'typescript-fsa';
import {
  createDomainActions,
  deleteDomain,
  deleteDomainActions,
  getDomainsActions,
  updateDomainActions,
  upsertDomain
} from './domains.actions';
import { entitiesFromPayload } from './domains.helpers';

/**
 * State
 */

export type State = RequestableDataWithEntityError<Domain[]>;

export const defaultState: State = {
  data: [],
  loading: true,
  lastUpdated: 0,
  error: {}
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, getDomainsActions.started)) {
    return {
      ...state,
      loading: true
    };
  }

  if (isType(action, getDomainsActions.done)) {
    const { result } = action.payload;
    return {
      ...state,
      data: entitiesFromPayload(result.data),
      results: result.results,
      lastUpdated: Date.now(),
      loading: false
    };
  }

  if (isType(action, getDomainsActions.failed)) {
    const { error } = action.payload;
    return {
      ...state,
      error: {
        read: error
      },
      loading: false
    };
  }

  if (isType(action, upsertDomain)) {
    const { payload } = action;
    const updated = updateOrAdd(payload, state.data);

    return {
      ...state,
      data: updated,
      results: updated.length
    };
  }

  if (isType(action, deleteDomain)) {
    const { payload } = action;
    const { data } = state;

    if (!data) {
      return state;
    }

    const filteredData = data.filter(domain => domain.id !== payload);

    return {
      ...state,
      data: filteredData,
      results: filteredData.length
    };
  }

  if (isType(action, createDomainActions.done)) {
    const { result } = action.payload;
    const updated = updateOrAdd(result, state.data);

    return {
      ...state,
      data: updated,
      results: updated.length
    };
  }

  if (isType(action, updateDomainActions.done)) {
    const { result } = action.payload;
    const updated = updateOrAdd(result, state.data);

    return {
      ...state,
      data: updated,
      results: updated.length
    };
  }

  if (isType(action, deleteDomainActions.done)) {
    const { domainId } = action.payload.params;
    const { data } = state;

    if (!data) {
      return state;
    }

    const filteredData = data.filter(domain => domain.id !== domainId);

    return {
      ...state,
      data: filteredData,
      results: filteredData.length
    };
  }

  return state;
};

export default reducer;

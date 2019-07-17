import { Reducer } from 'redux';
import { RequestableDataWithEntityError } from 'src/store/types';
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
import { entitiesFromPayload } from './domains.helpers';

/**
 * State
 */

export type State = RequestableDataWithEntityError<Linode.Domain[]>;

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
  if (isType(action, getDomainsRequest)) {
    return {
      ...state,
      loading: true
    };
  }

  if (isType(action, getDomainsSuccess)) {
    const {
      payload: { data, results }
    } = action;
    return {
      ...state,
      data: entitiesFromPayload(data),
      results,
      lastUpdated: Date.now(),
      loading: false
    };
  }

  if (isType(action, getDomainsFailure)) {
    const { payload } = action;
    return {
      ...state,
      error: {
        read: payload
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

    return {
      ...state,
      data: data.filter(domain => domain.id !== payload),
      results: data.length
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

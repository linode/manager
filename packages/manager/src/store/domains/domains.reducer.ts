import { Domain } from '@linode/api-v4/lib/domains';
import { Reducer } from 'redux';
import {
  EntityError,
  MappedEntityState2 as MappedEntityState,
} from 'src/store/types';
import { isType } from 'typescript-fsa';
import {
  addEntityRecord,
  createDefaultState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onGetPageSuccess,
  onStart,
  setError,
} from '../store.helpers.tmp';
import {
  createDomainActions,
  deleteDomain,
  deleteDomainActions,
  getDomainsActions,
  getDomainsPageActions,
  updateDomainActions,
  upsertDomain,
  upsertMultipleDomains,
} from './domains.actions';

/**
 * State
 */

export type State = MappedEntityState<Domain, EntityError>;

export const defaultState: State = createDefaultState({}, {});

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, getDomainsActions.started)) {
    return onStart(state);
  }

  if (isType(action, getDomainsActions.done)) {
    const { result } = action.payload;
    return onGetAllSuccess(result.data, state, result.results);
  }

  if (isType(action, getDomainsActions.failed)) {
    const { error } = action.payload;
    return onError(
      {
        read: error,
      },
      state
    );
  }

  if (isType(action, upsertDomain)) {
    const { payload } = action;
    const updated = addEntityRecord(state.itemsById, payload);

    return {
      ...state,
      itemsById: updated,
      results: Object.keys(updated).length,
    };
  }

  // Upsert multiple Domains at once (vs. separate action & UI update for each Domain).
  if (isType(action, upsertMultipleDomains)) {
    const { payload } = action;
    let updated = state.itemsById;
    payload.forEach(thisDomain => {
      updated = addEntityRecord(updated, thisDomain);
    });

    return {
      ...state,
      itemsById: updated,
      results: Object.keys(updated).length,
    };
  }

  if (isType(action, deleteDomain)) {
    const { payload } = action;
    onDeleteSuccess(payload, state);
  }

  if (isType(action, createDomainActions.started)) {
    return setError({ create: undefined }, state);
  }

  if (isType(action, createDomainActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, createDomainActions.failed)) {
    const { error } = action.payload;
    return onError(
      {
        create: error,
      },
      state
    );
  }

  if (isType(action, updateDomainActions.started)) {
    return setError({ update: undefined }, state);
  }

  if (isType(action, updateDomainActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, updateDomainActions.failed)) {
    const { error } = action.payload;
    return onError(
      {
        update: error,
      },
      state
    );
  }

  if (isType(action, deleteDomainActions.started)) {
    return setError({ delete: undefined }, state);
  }

  if (isType(action, deleteDomainActions.done)) {
    return onDeleteSuccess(action.payload.params.domainId, state);
  }

  if (isType(action, deleteDomainActions.failed)) {
    const { error } = action.payload;
    return onError(
      {
        delete: error,
      },
      state
    );
  }

  if (isType(action, getDomainsPageActions.started)) {
    return setError({ read: undefined }, state);
  }

  if (isType(action, getDomainsPageActions.done)) {
    const { result } = action.payload;

    return onGetPageSuccess(result.data, state, result.results);
  }

  if (isType(action, getDomainsPageActions.failed)) {
    const { error } = action.payload;
    return onError({ read: error }, state);
  }

  return state;
};

export default reducer;

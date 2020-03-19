import { Domain } from 'linode-js-sdk/lib/domains';
import { Reducer } from 'redux';
import {
  EntityError,
  MappedEntityState2 as MappedEntityState
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
  onStart
} from '../store.helpers.tmp';
import {
  createDomainActions,
  deleteDomain,
  deleteDomainActions,
  getDomainsActions,
  getDomainsPageActions,
  updateDomainActions,
  upsertDomain
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
        read: error
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
      results: Object.keys(updated).length
    };
  }

  if (isType(action, deleteDomain)) {
    const { payload } = action;
    onDeleteSuccess(payload, state);
  }

  if (isType(action, createDomainActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, updateDomainActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, deleteDomainActions.done)) {
    onDeleteSuccess(action.payload.params.domainId, state);
  }

  if (isType(action, getDomainsPageActions.started)) {
    return state;
  }

  if (isType(action, getDomainsPageActions.done)) {
    const { result } = action.payload;

    return onGetPageSuccess(result.data, state, result.results);
  }

  if (isType(action, getDomainsPageActions.failed)) {
    return state;
  }

  return state;
};

export default reducer;

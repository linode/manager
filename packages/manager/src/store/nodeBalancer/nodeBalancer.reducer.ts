import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { Reducer } from 'redux';
import {
  EntityError,
  MappedEntityState2 as MappedEntityState,
} from 'src/store/types';
import { isType } from 'typescript-fsa';
import {
  createDefaultState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onGetPageSuccess,
  onStart,
} from '../store.helpers.tmp';
import {
  createNodeBalancersActions,
  deleteNodeBalancerActions,
  getAllNodeBalancersActions,
  getNodeBalancersPageActions,
  getNodeBalancerWithConfigsActions,
  updateNodeBalancersActions,
} from './nodeBalancer.actions';

export type State = MappedEntityState<NodeBalancer, EntityError>;

export const defaultState: State = createDefaultState({}, {});

const reducer: Reducer<State> = (state = defaultState, action) => {
  /** Get all */
  if (isType(action, getAllNodeBalancersActions.started)) {
    return onStart(state);
  }

  if (isType(action, getAllNodeBalancersActions.done)) {
    const { result } = action.payload;

    if (result.data.length === 0) {
      return {
        ...state,
        loading: false,
        lastUpdated: Date.now(),
      };
    }

    return onGetAllSuccess(result.data, state, result.results);
  }

  if (isType(action, getAllNodeBalancersActions.failed)) {
    const { error } = action.payload;
    return onError<MappedEntityState<NodeBalancer, EntityError>, EntityError>(
      {
        read: error,
      },
      state
    );
  }

  /** Create */

  if (isType(action, createNodeBalancersActions.started)) {
    return onError({ create: undefined }, state);
  }

  if (isType(action, createNodeBalancersActions.done)) {
    const { result } = action.payload;

    return onCreateOrUpdate(result, state);
  }

  if (isType(action, createNodeBalancersActions.failed)) {
    const { error } = action.payload;

    return onError({ create: error }, state);
  }

  /** Update */

  if (isType(action, updateNodeBalancersActions.started)) {
    return onError({ update: undefined }, state);
  }

  if (isType(action, updateNodeBalancersActions.done)) {
    const { result } = action.payload;

    return onCreateOrUpdate(result, state);
  }

  if (isType(action, updateNodeBalancersActions.failed)) {
    const { error } = action.payload;

    return onError({ update: error }, state);
  }

  /** Delete */

  if (isType(action, deleteNodeBalancerActions.started)) {
    return onError({ delete: undefined }, state);
  }

  if (isType(action, deleteNodeBalancerActions.done)) {
    const {
      params: { nodeBalancerId },
    } = action.payload;

    return onDeleteSuccess(nodeBalancerId, state);
  }

  if (isType(action, deleteNodeBalancerActions.failed)) {
    const { error } = action.payload;

    return onError({ delete: error }, state);
  }

  /** Add */
  if (isType(action, getNodeBalancerWithConfigsActions.done)) {
    const { result } = action.payload;

    return onCreateOrUpdate(result, state);
  }

  /** Get single page */

  if (isType(action, getNodeBalancersPageActions.started)) {
    return onStart(state);
  }

  if (isType(action, getNodeBalancersPageActions.done)) {
    const { result } = action.payload;

    return onGetPageSuccess(result.data, state, result.results);
  }

  if (isType(action, getNodeBalancersPageActions.failed)) {
    const { error } = action.payload;

    return onError({ read: error }, state);
  }

  return state;
};

export default reducer;

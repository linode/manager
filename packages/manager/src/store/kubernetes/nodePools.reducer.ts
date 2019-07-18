import { Reducer } from 'redux';
import { EntityError, EntityState } from 'src/store/types';
import updateOrAdd from 'src/utilities/updateOrAdd';
import { isType } from 'typescript-fsa';
import {
  createNodePoolActions,
  deleteNodePoolActions,
  ExtendedNodePool,
  requestNodePoolsActions,
  setErrors,
  updateNodePoolActions
} from './nodePools.actions';

/**
 * State
 */

export type State = EntityState<ExtendedNodePool, EntityError>;

export const defaultState: State = {
  results: [],
  entities: [],
  loading: true,
  lastUpdated: 0,
  error: {}
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, requestNodePoolsActions.done)) {
    const { result } = action.payload;

    // If there's nothing to add, return the state unchanged.
    if (result.length === 0) {
      return state;
    }

    /**
     * This action payload is the current node pools for a single
     * cluster. We need to add them to state, but make sure
     * that we don't re-add existing ones for that cluster.
     */
    const clusterID = result[0].clusterID;
    const filteredPools = state.entities.filter(
      thisPool => thisPool.clusterID !== clusterID
    );
    const newPools = [...filteredPools, ...result];

    return {
      ...state,
      entities: newPools,
      results: newPools.map(p => p.id),
      loading: false
    };
  }

  if (isType(action, requestNodePoolsActions.failed)) {
    const { error } = action.payload;

    return {
      ...state,
      loading: false,
      error: {
        ...state.error,
        read: error
      }
    };
  }

  if (isType(action, createNodePoolActions.done)) {
    const { result } = action.payload;

    return {
      ...state,
      entities: [...state.entities, result],
      results: [...state.results, result.id],
      error: {
        ...state.error,
        create: undefined
      }
    };
  }

  if (isType(action, createNodePoolActions.failed)) {
    const { error } = action.payload;

    return {
      ...state,
      error: {
        ...state.error,
        create: error
      }
    };
  }

  if (isType(action, updateNodePoolActions.failed)) {
    const { error } = action.payload;

    return {
      ...state,
      error: {
        ...state.error,
        update: error
      }
    };
  }

  if (isType(action, updateNodePoolActions.done)) {
    const { result } = action.payload;

    const update = updateOrAdd(result, state.entities);

    return {
      ...state,
      entities: update,
      results: update.map(c => c.id)
    };
  }

  if (isType(action, deleteNodePoolActions.done)) {
    const {
      params: { nodePoolID }
    } = action.payload;

    const updatedPools = state.entities.filter(
      thisPool => thisPool.id !== nodePoolID
    );

    return {
      ...state,
      entities: updatedPools,
      results: updatedPools.map(p => p.id)
    };
  }

  if (isType(action, deleteNodePoolActions.failed)) {
    const { error } = action.payload;

    return {
      ...state,
      error: {
        ...state.error,
        delete: error
      }
    };
  }

  if (isType(action, setErrors)) {
    const error = action.payload;
    return {
      ...state,
      error
    };
  }
  return state;
};

export default reducer;

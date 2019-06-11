import { Reducer } from 'redux';
import { EntityError, EntityState } from 'src/store/types';
import updateOrAdd from 'src/utilities/updateOrAdd';
import { isType } from 'typescript-fsa';
import {
  createNodePoolActions,
  requestClustersActions,
  updateClusterActions,
  updateNodePoolActions,
  upsertCluster
} from './kubernetes.actions';

/**
 * State
 */

export type State = EntityState<Linode.KubernetesCluster, EntityError>;

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
  if (isType(action, requestClustersActions.started)) {
    return {
      ...state,
      loading: true
    };
  }

  if (isType(action, requestClustersActions.done)) {
    const { result } = action.payload;
    return {
      ...state,
      entities: result,
      results: result.map(cluster => cluster.id),
      lastUpdated: Date.now(),
      loading: false
    };
  }

  if (isType(action, requestClustersActions.failed)) {
    const { error } = action.payload;
    return {
      ...state,
      error: { ...state.error, read: error },
      loading: false
    };
  }

  if (isType(action, upsertCluster)) {
    const { payload } = action;
    const entities = updateOrAdd(payload, state.entities);

    return {
      ...state,
      entities,
      results: entities.map(cluster => cluster.id)
    };
  }

  if (isType(action, updateClusterActions.done)) {
    const { result } = action.payload;
    const update = updateOrAdd(result, state.entities);

    return {
      ...state,
      entities: update,
      results: update.map(cluster => cluster.id)
    };
  }

  if (isType(action, createNodePoolActions.done)) {
    const { result } = action.payload;
    const cluster = state.entities.find(
      thisCluster => +thisCluster.id === result[0].lke_id
    );
    if (!cluster) {
      return state;
    }
    const updatedCluster = {
      ...cluster,
      node_pools: result
    };

    const update = updateOrAdd(updatedCluster, state.entities);

    return {
      ...state,
      entities: update,
      results: update.map(c => c.id)
    };
  }

  if (isType(action, updateNodePoolActions.done)) {
    const { result } = action.payload;
    const cluster = state.entities.find(
      thisCluster => +thisCluster.id === result[0].lke_id
    );
    if (!cluster) {
      return state;
    }
    const updatedCluster = {
      ...cluster,
      node_pools: result
    };

    const update = updateOrAdd(updatedCluster, state.entities);

    return {
      ...state,
      entities: update,
      results: update.map(c => c.id)
    };
  }
  return state;
};

export default reducer;

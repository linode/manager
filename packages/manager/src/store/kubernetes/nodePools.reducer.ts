import produce from 'immer';
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
  loading: false,
  lastUpdated: 0,
  error: {}
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  return produce(state, draft => {
    if (isType(action, requestNodePoolsActions.done)) {
      const { result } = action.payload;
      // If this condition is false we don't have to update the state
      if (result.length !== 0) {
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

        draft.entities = newPools;
        draft.results = newPools.map(p => p.id);
      }
      draft.loading = false;
      draft.lastUpdated = Date.now();
    }

    if (isType(action, requestNodePoolsActions.started)) {
      draft.loading = true;
    }

    if (isType(action, requestNodePoolsActions.failed)) {
      const { error } = action.payload;

      draft.loading = false;
      draft.error!.read = error;
    }

    if (isType(action, createNodePoolActions.done)) {
      const { result } = action.payload;

      draft.entities.push(result);
      draft.results.push(result.id);
      draft.error!.create = undefined;
    }

    if (isType(action, createNodePoolActions.failed)) {
      const { error } = action.payload;
      draft.error!.create = error;
    }

    if (isType(action, updateNodePoolActions.failed)) {
      const { error } = action.payload;
      draft.error!.update = error;
    }

    if (isType(action, updateNodePoolActions.done)) {
      const { result } = action.payload;

      const update = updateOrAdd(result, state.entities);

      draft.entities = update;
      draft.results = update.map(c => c.id);
    }

    if (isType(action, deleteNodePoolActions.done)) {
      const {
        params: { nodePoolID }
      } = action.payload;

      const updatedPools = state.entities.filter(
        thisPool => thisPool.id !== nodePoolID
      );

      draft.entities = updatedPools;
      draft.results = updatedPools.map(p => p.id);
    }

    if (isType(action, deleteNodePoolActions.failed)) {
      const { error } = action.payload;
      draft.error!.delete = error;
    }

    if (isType(action, setErrors)) {
      const error = action.payload;
      draft.error = error;
    }
  });
};

export default reducer;

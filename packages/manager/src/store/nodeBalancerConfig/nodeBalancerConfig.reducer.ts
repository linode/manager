import produce from 'immer';
import { NodeBalancerConfig } from '@linode/api-v4/lib/nodebalancers';
import { Reducer } from 'redux';
import { EntityError, RelationalMappedEntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import { deleteNodeBalancerActions } from '../nodeBalancer/nodeBalancer.actions';
import {
  addMany,
  ensureInitializedNestedState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart,
  removeMany,
} from '../store.helpers.tmp';
import {
  addNodeBalancerConfigs,
  createNodeBalancerConfigActions,
  deleteNodeBalancerConfigActions,
  getAllNodeBalancerConfigsActions,
  removeNodeBalancerConfigs,
  updateNodeBalancerConfigActions,
} from './nodeBalancerConfig.actions';

export type State = RelationalMappedEntityState<
  NodeBalancerConfig,
  EntityError
>;

export const defaultState: State = {};

const reducer: Reducer<State> = (state = defaultState, action) => {
  return produce(state, draft => {
    if (isType(action, getAllNodeBalancerConfigsActions.started)) {
      const { nodeBalancerId } = action.payload;
      draft = ensureInitializedNestedState(draft, nodeBalancerId);

      draft[nodeBalancerId] = onStart(draft[nodeBalancerId]);
    }

    if (isType(action, getAllNodeBalancerConfigsActions.done)) {
      const { result } = action.payload;
      const { nodeBalancerId } = action.payload.params;
      draft = ensureInitializedNestedState(draft, nodeBalancerId);

      draft[nodeBalancerId] = onGetAllSuccess(
        result.data,
        draft[nodeBalancerId],
        result.results
      );
    }

    if (isType(action, getAllNodeBalancerConfigsActions.failed)) {
      const { error } = action.payload;
      const { nodeBalancerId } = action.payload.params;

      draft = ensureInitializedNestedState(draft, nodeBalancerId);

      draft[nodeBalancerId] = onError({ read: error }, draft[nodeBalancerId]);
    }

    /** Create */

    if (isType(action, createNodeBalancerConfigActions.started)) {
      const { nodeBalancerId } = action.payload;

      draft = ensureInitializedNestedState(draft, nodeBalancerId);
      draft[nodeBalancerId].error.create = undefined;
    }

    if (isType(action, createNodeBalancerConfigActions.done)) {
      const { result } = action.payload;
      const { nodeBalancerId } = action.payload.params;

      draft = ensureInitializedNestedState(draft, nodeBalancerId);
      draft[nodeBalancerId] = onCreateOrUpdate(result, draft[nodeBalancerId]);
    }

    if (isType(action, createNodeBalancerConfigActions.failed)) {
      const { error } = action.payload;
      const { nodeBalancerId } = action.payload.params;

      draft = ensureInitializedNestedState(draft, nodeBalancerId);
      draft[nodeBalancerId].error.create = error;
    }

    /** Update */
    if (isType(action, updateNodeBalancerConfigActions.started)) {
      const { nodeBalancerId } = action.payload;
      draft = ensureInitializedNestedState(draft, nodeBalancerId);
      draft[nodeBalancerId].error.update = undefined;
    }

    if (isType(action, updateNodeBalancerConfigActions.done)) {
      const { result } = action.payload;
      const { nodeBalancerId } = action.payload.params;
      draft = ensureInitializedNestedState(draft, nodeBalancerId, {
        results: 0,
      });
      draft[nodeBalancerId] = onCreateOrUpdate(result, draft[nodeBalancerId]);
    }

    if (isType(action, updateNodeBalancerConfigActions.failed)) {
      const { error } = action.payload;
      const { nodeBalancerId } = action.payload.params;

      draft[nodeBalancerId] = onError({ update: error }, draft[nodeBalancerId]);
    }

    /** Delete */
    if (isType(action, deleteNodeBalancerConfigActions.started)) {
      const { nodeBalancerId } = action.payload;

      draft = ensureInitializedNestedState(draft, nodeBalancerId);
      draft[nodeBalancerId].error.delete = undefined;
    }

    if (isType(action, deleteNodeBalancerConfigActions.done)) {
      const { nodeBalancerConfigId, nodeBalancerId } = action.payload.params;

      draft[nodeBalancerId] = onDeleteSuccess(
        nodeBalancerConfigId,
        draft[nodeBalancerId]
      );
    }

    if (isType(action, deleteNodeBalancerConfigActions.failed)) {
      const { error } = action.payload;
      const { nodeBalancerId } = action.payload.params;

      draft = ensureInitializedNestedState(draft, nodeBalancerId, {
        results: 0,
      });
      draft[nodeBalancerId].error.delete = error;
    }

    if (isType(action, removeNodeBalancerConfigs)) {
      const { configIDs, nodeBalancerId } = action.payload;
      draft = ensureInitializedNestedState(draft, nodeBalancerId, {
        results: 0,
      });
      draft[nodeBalancerId] = removeMany(
        configIDs.map(String),
        draft[nodeBalancerId]
      );
    }

    if (isType(action, addNodeBalancerConfigs)) {
      const { configs, nodeBalancerId } = action.payload;

      draft = ensureInitializedNestedState(draft, nodeBalancerId, {
        results: 0,
      });
      draft[nodeBalancerId] = addMany(configs, draft[nodeBalancerId]);
    }

    /** When a NodeBalancer is deleted, we need to remove all of its configs. */
    if (isType(action, deleteNodeBalancerActions.done)) {
      const {
        params: { nodeBalancerId },
      } = action.payload;
      delete draft[nodeBalancerId];
    }
  });
};

export default reducer;

import produce from 'immer';
import { NodeBalancerConfigNode } from '@linode/api-v4/lib/nodebalancers';
import { Reducer } from 'redux';
import {
  ensureInitializedNestedState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart,
} from 'src/store/store.helpers.tmp';
import { EntityError, RelationalMappedEntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import {
  createNodeBalancerConfigNodeActions,
  deleteNodeBalancerConfigNodeActions,
  requestNodeBalancerConfigNodesActions,
  updateNodeBalancerConfigNodeActions,
} from './configNode.actions';

/**
 * State
 */

export type State = RelationalMappedEntityState<
  NodeBalancerConfigNode,
  EntityError
>;

export const defaultState: State = {};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  return produce(state, draft => {
    if (isType(action, requestNodeBalancerConfigNodesActions.started)) {
      const { configId } = action.payload;
      draft = ensureInitializedNestedState(draft, configId, { results: 0 });
      draft[configId] = onStart(draft[configId]);
    }

    if (isType(action, requestNodeBalancerConfigNodesActions.done)) {
      const { result } = action.payload;
      const { configId } = action.payload.params;
      draft = ensureInitializedNestedState(draft, configId, { results: 0 });

      draft[configId] = onGetAllSuccess(
        result.data,
        draft[configId],
        result.results
      );
    }

    if (isType(action, requestNodeBalancerConfigNodesActions.failed)) {
      const { error } = action.payload;
      const { configId } = action.payload.params;
      draft = ensureInitializedNestedState(draft, configId, { results: 0 });

      draft[configId] = onError({ read: error }, draft[configId]);
    }

    if (isType(action, createNodeBalancerConfigNodeActions.started)) {
      const { configId } = action.payload;

      draft = ensureInitializedNestedState(draft, configId, { results: 0 });
      draft[configId].error.create = undefined;
    }

    if (isType(action, createNodeBalancerConfigNodeActions.done)) {
      const { result } = action.payload;
      const { configId } = action.payload.params;

      draft = ensureInitializedNestedState(draft, configId, { results: 0 });
      draft[configId] = onCreateOrUpdate(result, draft[configId]);
    }

    if (isType(action, createNodeBalancerConfigNodeActions.failed)) {
      const { error } = action.payload;
      const { configId } = action.payload.params;

      draft = ensureInitializedNestedState(draft, configId, { results: 0 });
      draft[configId].error.create = error;
    }

    if (isType(action, updateNodeBalancerConfigNodeActions.started)) {
      const { configId } = action.payload;

      draft = ensureInitializedNestedState(draft, configId, { results: 0 });
      draft[configId].error.update = undefined;
    }

    if (isType(action, updateNodeBalancerConfigNodeActions.done)) {
      const { result } = action.payload;
      const { configId } = action.payload.params;

      draft = ensureInitializedNestedState(draft, configId, { results: 0 });
      draft[configId] = onCreateOrUpdate(result, draft[configId]);
    }

    if (isType(action, updateNodeBalancerConfigNodeActions.failed)) {
      const { error } = action.payload;
      const { configId } = action.payload.params;

      draft = ensureInitializedNestedState(draft, configId, { results: 0 });
      draft[configId].error.update = error;
    }

    if (isType(action, deleteNodeBalancerConfigNodeActions.started)) {
      const { configId } = action.payload;

      draft = ensureInitializedNestedState(draft, configId, { results: 0 });
      draft[configId].error.delete = undefined;
    }

    if (isType(action, deleteNodeBalancerConfigNodeActions.done)) {
      const { nodeId, configId } = action.payload.params;

      draft[configId] = onDeleteSuccess(nodeId, draft[configId]);
    }

    if (isType(action, deleteNodeBalancerConfigNodeActions.failed)) {
      const { error } = action.payload;
      const { configId } = action.payload.params;

      draft = ensureInitializedNestedState(draft, configId, { results: 0 });
      draft[configId].error.delete = error;
    }
  });
};

export default reducer;

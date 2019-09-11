import produce from 'immer';
import { NodeBalancerConfigNode } from 'linode-js-sdk/lib/nodebalancers';
import { Reducer } from 'redux';
import { EntityError, EntityState } from 'src/store/types';
import updateOrAdd from 'src/utilities/updateOrAdd';
import { isType } from 'typescript-fsa';
import {
  createNodeBalancerConfigNodeActions,
  deleteNodeBalancerConfigNodeActions,
  requestNodeBalancerConfigNodesActions,
  updateNodeBalancerConfigNodeActions
} from './configNode.actions';

/**
 * State
 */

export type State = EntityState<NodeBalancerConfigNode, EntityError>;

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
    if (isType(action, requestNodeBalancerConfigNodesActions.started)) {
      draft.loading = true;
      draft.error!.read = undefined;
    }

    if (isType(action, requestNodeBalancerConfigNodesActions.done)) {
      const { result } = action.payload;
      draft.loading = false;
      draft.entities = result;
      draft.results = result.map(n => n.id);
      draft.lastUpdated = Date.now();
    }

    if (isType(action, requestNodeBalancerConfigNodesActions.failed)) {
      const { error } = action.payload;
      draft.loading = false;
      draft.error!.read = error;
    }

    if (isType(action, createNodeBalancerConfigNodeActions.started)) {
      draft.error!.create = undefined;
    }

    if (isType(action, createNodeBalancerConfigNodeActions.done)) {
      const { result } = action.payload;
      draft.entities.push(result);
      draft.results.push(result.id);
      draft.lastUpdated = Date.now();
    }

    if (isType(action, createNodeBalancerConfigNodeActions.failed)) {
      const { error } = action.payload;
      draft.error!.create = error;
    }

    if (isType(action, updateNodeBalancerConfigNodeActions.started)) {
      draft.error!.update = undefined;
    }

    if (isType(action, updateNodeBalancerConfigNodeActions.done)) {
      const { result } = action.payload;
      draft.entities = updateOrAdd(result, state.entities);
      draft.lastUpdated = Date.now();
    }

    if (isType(action, updateNodeBalancerConfigNodeActions.failed)) {
      const { error } = action.payload;
      draft.error!.update = error;
    }

    if (isType(action, deleteNodeBalancerConfigNodeActions.started)) {
      draft.error!.delete = undefined;
    }

    if (isType(action, deleteNodeBalancerConfigNodeActions.done)) {
      const { params } = action.payload;
      draft.entities = state.entities.filter(
        thisNode => thisNode.id !== params.nodeId
      );
      draft.results = state.results.filter(n => n !== params.nodeId);
      draft.lastUpdated = Date.now();
    }

    if (isType(action, deleteNodeBalancerConfigNodeActions.failed)) {
      const { error } = action.payload;
      draft.error!.delete = error;
    }
  });
};

export default reducer;

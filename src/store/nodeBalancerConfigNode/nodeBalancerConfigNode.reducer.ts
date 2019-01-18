import { assoc, omit } from 'ramda';
import { Reducer } from "redux";
import { NodeBalancerConfigNode } from 'src/services/nodebalancers';
import { MappedEntityState } from 'src/store/types';
import { isType } from "typescript-fsa";
import { createDefaultState, onError, onStart } from "../store.helpers";
import { createNodeBalancerConfigNodesActions, deleteNodeBalancerConfigNodesActions, getAllNodeBalancerConfigNodesActions, updateNodeBalancerConfigNodesActions } from "./nodeBalancerConfigNode.actions";

export type State = MappedEntityState<NodeBalancerConfigNode>;

export const defaultState: State = createDefaultState({ loading: false });

const reducer: Reducer<State> = (state = defaultState, action) => {
  /** Get All */
  if (isType(action, getAllNodeBalancerConfigNodesActions.started)) {
    return onStart(state);
  }

  if (isType(action, getAllNodeBalancerConfigNodesActions.done)) {
    const { result } = action.payload;

    if (result.length === 0) {
      return {
        ...state,
        loading: false,
        lastUpdated: Date.now(),
      };
    }

    /**
     * We must merge the items onto state, rather than replacing state with the new items.
     */
    const itemsById = result.reduce(
      (updatedItemsById, config) => assoc(String(config.id), config, updatedItemsById),
      state.itemsById,
    );

    return {
      ...state,
      items: Object.keys(itemsById),
      itemsById,
      loading: false,
      lastUpdated: Date.now(),
    };
  }

  if (isType(action, getAllNodeBalancerConfigNodesActions.failed)) {
    const { error } = action.payload;
    return onError(error, state);
  }

  /** Create */
  if (isType(action, createNodeBalancerConfigNodesActions.started)) { }

  if (isType(action, createNodeBalancerConfigNodesActions.done)) {
    const { result } = action.payload;
    const updated = assoc(String(result.id), result, state.itemsById);

    return {
      ...state,
      itemsById: updated,
      items: Object.keys(updated),
    }
  }

  if (isType(action, createNodeBalancerConfigNodesActions.failed)) { }

  /** Update */
  if (isType(action, updateNodeBalancerConfigNodesActions.started)) { }

  if (isType(action, updateNodeBalancerConfigNodesActions.done)) {
    const { result } = action.payload;
    const updated = assoc(String(result.id), result, state.itemsById);

    return {
      ...state,
      itemsById: updated,
      items: Object.keys(updated),
    }
  }

  if (isType(action, updateNodeBalancerConfigNodesActions.failed)) { }

  /** Delete */
  if (isType(action, deleteNodeBalancerConfigNodesActions.started)) { }

  if (isType(action, deleteNodeBalancerConfigNodesActions.done)) {
    const { params: { nodeBalancerConfigNodeId } } = action.payload;
    const updated = omit([String(nodeBalancerConfigNodeId)], state.itemsById);

    return {
      ...state,
      itemsById: updated,
      items: Object.keys(updated),
    }
  }

  if (isType(action, deleteNodeBalancerConfigNodesActions.failed)) { }

  return state;
};

export default reducer;

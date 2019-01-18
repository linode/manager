
import { assoc, omit } from 'ramda';
import { Reducer } from "redux";
import { MappedEntityState } from 'src/store/types';
import { isType } from "typescript-fsa";
import { createDefaultState, onError, onStart } from "../store.helpers";
import { createNodeBalancerConfigActions, deleteNodeBalancerConfigActions, getAllNodeBalancerConfigsActions, updateNodeBalancerConfigActions } from "./nodeBalancerConfig.actions";

export type State = MappedEntityState<Linode.NodeBalancerConfig>;

export const defaultState: State = createDefaultState({ loading: false });

const reducer: Reducer<State> = (state = defaultState, action) => {
  /** Get All */
  if (isType(action, getAllNodeBalancerConfigsActions.started)) {
    return onStart(state);
  }

  if (isType(action, getAllNodeBalancerConfigsActions.done)) {
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

  if (isType(action, getAllNodeBalancerConfigsActions.failed)) {
    return onError(action.payload.error, state);
  }

  /** Create */
  if (isType(action, createNodeBalancerConfigActions.started)) { }

  if (isType(action, createNodeBalancerConfigActions.done)) {
    const { itemsById } = state;
    const { result } = action.payload;
    const updated = assoc(String(result.id), result, itemsById)

    return {
      ...state,
      itemsById: updated,
      items: Object.keys(updated),
    }
  }

  if (isType(action, createNodeBalancerConfigActions.failed)) { }

  /** Update */
  if (isType(action, updateNodeBalancerConfigActions.started)) { }

  if (isType(action, updateNodeBalancerConfigActions.done)) {
    const { itemsById } = state;
    const { result } = action.payload;
    const updated = assoc(String(result.id), result, itemsById)

    return {
      ...state,
      itemsById: updated,
      items: Object.keys(updated),
    }
  }

  if (isType(action, updateNodeBalancerConfigActions.failed)) { }

  /** Delete */
  if (isType(action, deleteNodeBalancerConfigActions.started)) { }

  if (isType(action, deleteNodeBalancerConfigActions.done)) {
    const { params: { nodeBalancerConfigId } } = action.payload;
    const { itemsById } = state;
    const updated = omit([String(nodeBalancerConfigId)], itemsById);

    return {
      ...state,
      itemsById: updated,
      items: Object.keys(updated),
    }
  }

  if (isType(action, deleteNodeBalancerConfigActions.failed)) { }

  return state;
};

export default reducer;

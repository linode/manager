
import { assoc } from 'ramda';
import { Reducer } from "redux";
import { NodeBalancerConfig } from 'src/services/nodebalancers';
import { MappedEntityState } from 'src/store/types';
import { isType } from "typescript-fsa";
import { createDefaultState, onCreateOrUpdate, onDeleteSuccess, onError, onStart } from "../store.helpers";
import { createNodeBalancerConfigActions, deleteNodeBalancerConfigActions, getAllNodeBalancerConfigsActions, updateNodeBalancerConfigActions } from "./nodeBalancerConfig.actions";

export type State = MappedEntityState<NodeBalancerConfig>;

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
  if (isType(action, createNodeBalancerConfigActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  /** Update */
  if (isType(action, updateNodeBalancerConfigActions.done)) {
   const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  /** Delete */
  if (isType(action, deleteNodeBalancerConfigActions.done)) {
    const { params: { nodeBalancerConfigId } } = action.payload;

    return onDeleteSuccess(nodeBalancerConfigId, state);
  }

  return state;
};

export default reducer;

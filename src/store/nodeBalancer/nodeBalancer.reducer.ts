
import { assoc, omit } from 'ramda';
import { Reducer } from "redux";
import { MappedEntityState } from 'src/store/types';
import { isType } from "typescript-fsa";
import { createDefaultState, onError, onGetAllSuccess, onStart } from "../store.helpers";
import { createNodeBalancersActions, deleteNodeBalancerActions, getAllNodeBalancersActions, updateNodeBalancersActions } from './nodeBalancer.actions';

export type State = MappedEntityState<Linode.NodeBalancer>;

export const defaultState: State = createDefaultState();

const reducer: Reducer<State> = (state = defaultState, action) => {
  /** Get all */
  if (isType(action, getAllNodeBalancersActions.started)) {
    return onStart(state);
  }

  if (isType(action, getAllNodeBalancersActions.done)) {
    const { result } = action.payload;

    if (result.length === 0) {
      return {
        ...state,
        loading: false,
        lastUpdated: Date.now(),
      };
    }

    return onGetAllSuccess(result, state);
  }

  if (isType(action, getAllNodeBalancersActions.failed)) {
    const { error } = action.payload;
    return onError(error, state)
  }

  /** Create */
  if (isType(action, createNodeBalancersActions.started)) {
    /**
     * We could optimistically create the NodeBalancer here in the store and update on success
     * or delete on failure if we wanted a faster UI response.
     */
  }

  if (isType(action, createNodeBalancersActions.done)) {
    const { result } = action.payload;
    const itemsById = assoc(String(result.id), result, state.itemsById);

    return {
      ...state,
      items: Object.keys(itemsById),
      itemsById,
    }
  }

  if (isType(action, createNodeBalancersActions.failed)) {
    /**
     * The error is sent back to the consumer via the Thunk Promise, and we have no need to
     * update global state in this case. noop.
     */
  }

  /** Update */
  if (isType(action, updateNodeBalancersActions.started)) {
    /**
     * We could optimistically update the NodeBalancer here in the store and update on success
     * or revert on failure if we wanted a faster UI response.
     */
  }

  if (isType(action, updateNodeBalancersActions.done)) {
    const { result } = action.payload;
    const itemsById = assoc(String(result.id), result, state.itemsById);

    return {
      ...state,
      items: Object.keys(itemsById),
      itemsById,
    }
  }

  if (isType(action, updateNodeBalancersActions.failed)) {
    /**
     * The error is sent back to the consumer via the Thunk Promise, and we have no need to
     * update global state in this case. noop.
     */
  }

  /** Delete */
  if (isType(action, deleteNodeBalancerActions.started)) {
    /**
     * We could optimistically create the NodeBalancer here in the store and update on success
     * or delete on failure if we wanted a faster UI response.
     */
  }

  if (isType(action, deleteNodeBalancerActions.done)) {
    const { itemsById } = state;
    const { params: { nodeBalancerId } } = action.payload;

    const n = itemsById[nodeBalancerId];
    if (!n) {
      return state;
    }

    const updated = omit([String(nodeBalancerId)], itemsById);

    return {
      ...state,
      items: Object.keys(updated),
      itemsById: updated,
    }
  }

  if (isType(action, deleteNodeBalancerActions.failed)) {
    /**
     * The error is sent back to the consumer via the Thunk Promise, and we have no need to
     * update global state in this case. noop.
     */
  }

  return state;
};

export default reducer;

import { assoc } from 'ramda';
import { Reducer } from 'redux';
import { NodeBalancerConfig } from 'src/services/nodebalancers';
import { MappedEntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import { deleteNodeBalancerActions } from '../nodeBalancer/nodeBalancer.actions';
import {
  addEntityRecord,
  addMany,
  createDefaultState,
  mapIDs,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onStart,
  removeMany
} from '../store.helpers';
import {
  addNodeBalancerConfigs,
  createNodeBalancerConfigActions,
  deleteNodeBalancerConfigActions,
  getAllNodeBalancerConfigsActions,
  removeNodeBalancerConfigs,
  updateNodeBalancerConfigActions
} from './nodeBalancerConfig.actions';

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
        lastUpdated: Date.now()
      };
    }

    /**
     * We must merge the items onto state, rather than replacing state with the new items.
     */
    const itemsById = result.reduce(
      (updatedItemsById, config) =>
        assoc(String(config.id), config, updatedItemsById),
      state.itemsById
    );

    return {
      ...state,
      items: Object.keys(itemsById),
      itemsById,
      loading: false,
      lastUpdated: Date.now()
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
    const {
      params: { nodeBalancerConfigId }
    } = action.payload;

    return onDeleteSuccess(nodeBalancerConfigId, state);
  }

  if (isType(action, removeNodeBalancerConfigs)) {
    const { payload } = action;

    return removeMany(payload.map(String), state);
  }

  if (isType(action, addNodeBalancerConfigs)) {
    const { payload } = action;

    return addMany(payload, state);
  }

  /** When a NodeBalancer is deleted, we need to remove all of it's configs. */
  if (isType(action, deleteNodeBalancerActions.done)) {
    const {
      params: { nodeBalancerId }
    } = action.payload;
    const updated = Object.values(state.itemsById).filter(
      ({ nodebalancer_id }) => nodebalancer_id !== nodeBalancerId
    );

    return {
      ...state,
      items: updated.map(mapIDs),
      itemsById: updated.reduce(addEntityRecord, {})
    };
  }

  return state;
};

export default reducer;

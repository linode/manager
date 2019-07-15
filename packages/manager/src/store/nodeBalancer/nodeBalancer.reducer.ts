import { Reducer } from 'redux';
import { EntityError, MappedEntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import {
  createDefaultState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart
} from '../store.helpers';
import {
  createNodeBalancersActions,
  deleteNodeBalancerActions,
  getAllNodeBalancersActions,
  getNodeBalancerWithConfigsActions,
  updateNodeBalancersActions
} from './nodeBalancer.actions';

export type State = MappedEntityState<Linode.NodeBalancer, EntityError>;

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
        lastUpdated: Date.now()
      };
    }

    return onGetAllSuccess(result, state);
  }

  if (isType(action, getAllNodeBalancersActions.failed)) {
    const { error } = action.payload;
    return onError<
      MappedEntityState<Linode.NodeBalancer, EntityError>,
      EntityError
    >(
      {
        read: error
      },
      state
    );
  }

  /** Create */

  if (isType(action, createNodeBalancersActions.done)) {
    const { result } = action.payload;

    return onCreateOrUpdate(result, state);
  }

  /** Update */
  if (isType(action, updateNodeBalancersActions.done)) {
    const { result } = action.payload;

    return onCreateOrUpdate(result, state);
  }

  /** Delete */
  if (isType(action, deleteNodeBalancerActions.done)) {
    const {
      params: { nodeBalancerId }
    } = action.payload;

    return onDeleteSuccess(nodeBalancerId, state);
  }

  /** Add */
  if (isType(action, getNodeBalancerWithConfigsActions.done)) {
    const { result } = action.payload;

    return onCreateOrUpdate(result, state);
  }

  return state;
};

export default reducer;

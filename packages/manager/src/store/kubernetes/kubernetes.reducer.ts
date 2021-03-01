import { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';
import { Reducer } from 'redux';
import {
  createDefaultState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart,
  setError,
} from 'src/store/store.helpers.tmp';
import {
  EntityError,
  MappedEntityState2 as MappedEntityState,
} from 'src/store/types';
import { isType } from 'typescript-fsa';
import {
  deleteClusterActions,
  requestClusterActions,
  requestClustersActions,
  setErrors,
  updateClusterActions,
  upsertCluster,
} from './kubernetes.actions';

/**
 * State
 */

export type State = MappedEntityState<KubernetesCluster, EntityError>;

export const defaultState: State = createDefaultState();

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, requestClustersActions.started)) {
    return onStart(state);
  }

  if (isType(action, requestClustersActions.done)) {
    const { result } = action.payload;
    return onGetAllSuccess(result.data, state, result.results);
  }

  if (isType(action, requestClustersActions.failed)) {
    const { error } = action.payload;
    return onError({ read: error }, state);
  }

  if (isType(action, upsertCluster)) {
    const { payload } = action;
    return onCreateOrUpdate(payload, state);
  }

  if (isType(action, updateClusterActions.started)) {
    return setError({ update: undefined }, state);
  }

  if (isType(action, updateClusterActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, updateClusterActions.failed)) {
    const { error } = action.payload;
    return onError({ update: error }, state);
  }

  if (isType(action, setErrors)) {
    const newErrors = action.payload;
    return setError(newErrors, state);
  }

  if (isType(action, deleteClusterActions.started)) {
    return setError({ delete: undefined }, state);
  }

  if (isType(action, deleteClusterActions.done)) {
    const {
      params: { clusterID },
    } = action.payload;
    return onDeleteSuccess(clusterID, state);
  }

  if (isType(action, deleteClusterActions.failed)) {
    const { error } = action.payload;
    return onError({ delete: error }, state);
  }

  if (isType(action, requestClusterActions.started)) {
    return setError({ read: undefined }, state);
  }

  if (isType(action, requestClusterActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, requestClusterActions.failed)) {
    const { error } = action.payload;
    return onError({ read: error }, state);
  }
  return state;
};

export default reducer;

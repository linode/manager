import produce from 'immer';
import { KubernetesCluster } from 'linode-js-sdk/lib/kubernetes';
import { Reducer } from 'redux';
import { EntityError, EntityState } from 'src/store/types';
import updateOrAdd from 'src/utilities/updateOrAdd';
import { isType } from 'typescript-fsa';
import {
  deleteClusterActions,
  requestClusterActions,
  requestClustersActions,
  setErrors,
  updateClusterActions,
  upsertCluster
} from './kubernetes.actions';

/**
 * State
 */

export type State = EntityState<KubernetesCluster, EntityError>;

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
    if (isType(action, requestClustersActions.started)) {
      draft.loading = true;
    }

    if (isType(action, requestClustersActions.done)) {
      const { result } = action.payload;
      draft.entities = result;
      draft.results = result.map(cluster => cluster.id);
      draft.lastUpdated = Date.now();
      draft.loading = false;
    }

    if (isType(action, requestClustersActions.failed)) {
      const { error } = action.payload;
      draft.error!.read = error;
      draft.loading = false;
    }

    if (isType(action, upsertCluster)) {
      const { payload } = action;
      const entities = updateOrAdd(payload, state.entities);

      draft.entities = entities;
      draft.results = entities.map(cluster => cluster.id);
    }

    if (isType(action, updateClusterActions.started)) {
      draft.error!.update = undefined;
    }

    if (isType(action, updateClusterActions.done)) {
      const { result } = action.payload;
      const update = updateOrAdd(result, state.entities);

      draft.entities = update;
      draft.results = update.map(cluster => cluster.id);
    }

    if (isType(action, updateClusterActions.failed)) {
      const { error } = action.payload;
      draft.error!.update = error;
    }

    if (isType(action, setErrors)) {
      const newErrors = action.payload;
      draft.error = newErrors;
    }

    if (isType(action, deleteClusterActions.started)) {
      draft.error!.delete = undefined;
    }

    if (isType(action, deleteClusterActions.done)) {
      const {
        params: { clusterID }
      } = action.payload;
      const entities = state.entities.filter(({ id }) => id !== clusterID);

      draft.entities = entities;
      draft.results = entities.map(c => c.id);
    }

    if (isType(action, deleteClusterActions.failed)) {
      const { error } = action.payload;
      draft.error!.delete = error;
    }

    if (isType(action, requestClusterActions.started)) {
      draft.error!.read = undefined;
      draft.loading = true;
    }

    if (isType(action, requestClusterActions.done)) {
      const { result } = action.payload;
      const entities = updateOrAdd(result, state.entities);

      draft.loading = false;
      draft.entities = entities;
      draft.results = entities.map(cluster => cluster.id);
    }

    if (isType(action, requestClusterActions.failed)) {
      const { error } = action.payload;
      draft.error!.read = error;
      draft.loading = false;
    }
  });
};

export default reducer;

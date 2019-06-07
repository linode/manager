import { Reducer } from 'redux';
import { EntityError, EntityState } from 'src/store/types';
// import updateOrAdd from 'src/utilities/updateOrAdd';
import { isType } from 'typescript-fsa';
import { requestClustersActions } from './kubernetes.actions';

/**
 * State
 */

export type State = EntityState<Linode.KubernetesCluster, EntityError>;

export const defaultState: State = {
  results: [],
  entities: [],
  loading: true,
  lastUpdated: 0,
  error: {}
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, requestClustersActions.started)) {
    return {
      ...state,
      loading: true
    };
  }

  if (isType(action, requestClustersActions.done)) {
    const { result } = action.payload;
    return {
      ...state,
      entities: result,
      results: result.map(cluster => cluster.id),
      lastUpdated: Date.now(),
      loading: false
    };
  }

  if (isType(action, requestClustersActions.failed)) {
    const { error } = action.payload;
    return {
      ...state,
      error: { ...state.error, read: error },
      loading: false
    };
  }
  return state;
};

export default reducer;

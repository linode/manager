import { ObjectStorageBucket } from 'linode-js-sdk/lib/object-storage';
import { Reducer } from 'redux';
import { RequestableRequiredData } from 'src/store/types';
import { isType } from 'typescript-fsa';
import { onStart } from '../store.helpers';
import {
  createBucketActions,
  deleteBucketActions,
  getAllBucketsForAllClustersActions
} from './bucket.actions';
import { BucketError } from './types';

/**
 * State
 */

// BucketState is an unusual case for two reasons:
// 1. Bucket IDs do not exist.
// 2. Buckets are requested per-cluster, and their errors are handled individually.
export type State = Omit<
  RequestableRequiredData<ObjectStorageBucket[]>,
  'error'
> & {
  bucketErrors?: BucketError[];
};

export const defaultState: State = {
  data: [],
  loading: true,
  lastUpdated: 0,
  bucketErrors: undefined
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  /*
   * Create Bucket
   **/

  // DONE
  if (isType(action, createBucketActions.done)) {
    const { result } = action.payload;
    return {
      ...state,
      data: [...state.data, result]
    };
  }

  /*
   * Get All Buckets from All Clusters
   **/

  // START
  if (isType(action, getAllBucketsForAllClustersActions.started)) {
    return onStart(state);
  }

  // DONE
  if (isType(action, getAllBucketsForAllClustersActions.done)) {
    const { result } = action.payload;
    return {
      ...state,
      data: result,
      lastUpdated: Date.now(),
      loading: false
    };
  }

  // FAILED
  if (isType(action, getAllBucketsForAllClustersActions.failed)) {
    const { error } = action.payload;
    return {
      ...state,
      loading: false,
      bucketErrors: error
    };
  }

  /*
   * Delete Bucket
   **/

  // DONE
  if (isType(action, deleteBucketActions.done)) {
    const { params } = action.payload;
    return {
      ...state,
      data: state.data.filter(
        bucket =>
          // Buckets don't have IDs, so we look at the cluster and label to
          // remove the deleted bucket from state
          !(bucket.label === params.label && bucket.cluster === params.cluster)
      )
    };
  }

  return state;
};

export default reducer;

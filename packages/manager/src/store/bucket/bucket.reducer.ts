import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import { Reducer } from 'redux';
import { RequestableRequiredData } from 'src/store/types';
import { isType } from 'typescript-fsa';
import {
  createBucketActions,
  deleteBucketActions,
  getAllBucketsForAllClustersActions,
  getBucketActions,
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
  loading: false,
  lastUpdated: 0,
  bucketErrors: undefined,
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  /**
   * Get Bucket
   */
  if (isType(action, getBucketActions.done)) {
    const { result } = action.payload;
    const idx = state.data.findIndex(
      (thisBucket) =>
        thisBucket.label === result.label &&
        thisBucket.cluster === result.cluster
    );

    const updatedData = [...state.data];
    if (idx !== -1) {
      updatedData[idx] = result;
      return {
        ...state,
        data: updatedData,
      };
    }

    return {
      ...state,
      data: [...state.data, result],
    };
  }

  /*
   * Create Bucket
   **/

  // DONE
  if (isType(action, createBucketActions.done)) {
    const { result } = action.payload;
    return {
      ...state,
      data: [...state.data, result],
    };
  }

  /*
   * Get All Buckets from All Clusters
   **/

  // START
  if (isType(action, getAllBucketsForAllClustersActions.started)) {
    return { ...state, loading: true, bucketErrors: undefined };
  }

  // DONE
  if (isType(action, getAllBucketsForAllClustersActions.done)) {
    const { result } = action.payload;
    return {
      ...state,
      data: result,
      lastUpdated: Date.now(),
      loading: false,
    };
  }

  // FAILED
  if (isType(action, getAllBucketsForAllClustersActions.failed)) {
    const { error } = action.payload;
    return {
      ...state,
      loading: false,
      bucketErrors: error,
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
        (bucket) =>
          // Buckets don't have IDs, so we look at the cluster and label to
          // remove the deleted bucket from state
          !(bucket.label === params.label && bucket.cluster === params.cluster)
      ),
    };
  }

  return state;
};

export default reducer;

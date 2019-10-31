import { ObjectStorageBucket } from 'linode-js-sdk/lib/object-storage';
import { Reducer } from 'redux';
import { RequestableRequiredData } from 'src/store/types';
import { isType } from 'typescript-fsa';
import { onStart } from '../store.helpers';
import {
  createBucketActions,
  deleteBucketActions,
  getAllBucketsActions
} from './bucket.actions';

/**
 * State
 */

// We are unable to use the "EntityState" pattern we've adopted, since IDs
// do not exist on buckets.
export type State = RequestableRequiredData<ObjectStorageBucket[]>;

export const defaultState: State = {
  data: [],
  loading: true,
  lastUpdated: 0,
  error: undefined
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
   * Get All Buckets
   **/

  // START
  if (isType(action, getAllBucketsActions.started)) {
    return onStart(state);
  }

  // DONE
  if (isType(action, getAllBucketsActions.done)) {
    const { result } = action.payload;
    return {
      ...state,
      data: result,
      lastUpdated: Date.now(),
      loading: false
    };
  }

  // FAILED
  if (isType(action, getAllBucketsActions.failed)) {
    const { error } = action.payload;
    return {
      ...state,
      loading: false,
      error
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

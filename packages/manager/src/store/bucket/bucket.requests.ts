import {
  createBucket as _createBucket,
  deleteBucket as _deleteBucket,
  getBucketsInCluster,
  ObjectStorageBucket,
  ObjectStorageBucketRequestPayload,
  ObjectStorageDeleteBucketRequestPayload
} from 'linode-js-sdk/lib/object-storage';
import { APIError } from 'linode-js-sdk/lib/types';
import { objectStorageClusterDisplay } from 'src/constants';
import { GetAllData, getAllWithArguments } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import {
  createBucketActions,
  deleteBucketActions,
  getAllBucketsForAllClustersActions
} from './bucket.actions';
import { BucketError } from './types';

/*
 * Create Bucket
 */

export type CreateBucketRequest = ObjectStorageBucketRequestPayload;
export const createBucket = createRequestThunk<
  CreateBucketRequest,
  ObjectStorageBucket,
  APIError[]
>(createBucketActions, data => _createBucket(data));

/*
 * Get All Buckets from All Clusters
 */
const _getAllBucketsInCluster = getAllWithArguments<ObjectStorageBucket>(
  getBucketsInCluster
);

/**
 * The most straightforward way to list a users buckets is to use the
 * `/object-storage/buckets` endpoint.
 *
 * A more fault-tolerant way is to use the per-cluster endpoint,
 * i.e. `/object-storage/buckets/{clusterId}`. If we use this endpoint, we can
 * list buckets from a cluster even if another cluster is experiencing an outage.
 *
 * This method requests all buckets from each cluster concurrently.
 *
 * Note: a slight oddity here is that in the case of failure, both the `done` and `failed` actions
 * will be dispatched. The reducer handles this and it should be OK, but handle with caution.
 */
export const getAllBucketsFromAllClusters: ThunkActionCreator<Promise<
  ObjectStorageBucket[]
>> = () => dispatch => {
  dispatch(getAllBucketsForAllClustersActions.started());

  // We use the cluster display map as the source of truth for cluster IDs.
  // From a philosophical point of view, it would be better to first request
  // `/object-storage/clusters` and use the result as the list of clusters to
  // request. This would be a relatively big performance hit, however, and we
  // have to maintain the cluster display map anyway, so it should always
  // be kept up-to-date with region support for OBJ.
  const clusterIds = Object.keys(objectStorageClusterDisplay);

  const promises = clusterIds.map(thisClusterId =>
    _getAllBucketsInCluster([thisClusterId]).catch(err => ({
      // We return a BucketError for each error. Errors are handled for each
      // promise so that we always end up in the `.then()` handler of `Promise.all()`.
      error: err,
      clusterId: thisClusterId
    }))
  );

  return Promise.all(promises).then(res => {
    const { data, errors } = gatherDataAndErrors(res);

    if (errors.length > 0) {
      dispatch(getAllBucketsForAllClustersActions.failed({ error: errors }));
    }

    if (data.length > 0) {
      dispatch(getAllBucketsForAllClustersActions.done({ result: data }));
    }

    return data;
  });
};

export const gatherDataAndErrors = (
  response: (GetAllData<ObjectStorageBucket> | BucketError)[]
) => {
  const initialData: ObjectStorageBucket[] = [];
  const initialError: BucketError[] = [];

  return response.reduce(
    (accumulator, currentDataOrError) => {
      if ('error' in currentDataOrError) {
        return {
          ...accumulator,
          errors: [...accumulator.errors, currentDataOrError]
        };
      }
      return {
        ...accumulator,
        data: [...accumulator.data, ...currentDataOrError.data]
      };
    },
    { data: initialData, errors: initialError }
  );
};

/*
 * Delete Bucket
 */
export type DeleteBucketRequest = ObjectStorageDeleteBucketRequestPayload;
export const deleteBucket = createRequestThunk<
  ObjectStorageDeleteBucketRequestPayload,
  {},
  APIError[]
>(deleteBucketActions, data => _deleteBucket(data));

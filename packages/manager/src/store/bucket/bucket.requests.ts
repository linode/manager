import {
  createBucket as _createBucket,
  deleteBucket as _deleteBucket,
  getBucket as _getBucket,
  getBucketsInCluster,
  ObjectStorageBucket,
  ObjectStorageBucketRequestPayload,
  ObjectStorageClusterID,
  ObjectStorageDeleteBucketRequestPayload
} from '@linode/api-v4/lib/object-storage';
import { GetAllData, getAllWithArguments } from 'src/utilities/getAll';
import { requestClusters } from '../clusters/clusters.actions';
import { createRequestThunk } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import {
  createBucketActions,
  deleteBucketActions,
  getAllBucketsForAllClustersActions,
  getBucketActions
} from './bucket.actions';
import { BucketError } from './types';

/*
 * Create Bucket
 */

export type CreateBucketRequest = ObjectStorageBucketRequestPayload;
export const createBucket = createRequestThunk(createBucketActions, data =>
  _createBucket(data)
);

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
 * will be dispatched. The reducer handles this and it should be OK, but proceed with caution.
 */
export const getAllBucketsFromAllClusters: ThunkActionCreator<
  Promise<ObjectStorageBucket[]>,
  ObjectStorageClusterID[]
> = clusterIds => dispatch => {
  dispatch(getAllBucketsForAllClustersActions.started());

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

    dispatch(getAllBucketsForAllClustersActions.done({ result: data }));

    return data;
  });
};

export const getAllClustersAndAllBuckets: ThunkActionCreator<Promise<
  ObjectStorageBucket[]
>> = () => (dispatch, getState) => {
  const clustersFromState = getState().__resources.clusters.entities;

  if (clustersFromState.length > 0) {
    return dispatch(
      getAllBucketsFromAllClusters(
        clustersFromState.map(thisCluster => thisCluster.id)
      )
    );
  }

  return dispatch(requestClusters()).then(clusters =>
    dispatch(
      getAllBucketsFromAllClusters(clusters.map(thisCluster => thisCluster.id))
    )
  );
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
export const deleteBucket = createRequestThunk(deleteBucketActions, data =>
  _deleteBucket(data)
);

/*
 * Get a Bucket
 */
export type GetBucketRequest = ObjectStorageBucketRequestPayload;
export const getBucket = createRequestThunk(getBucketActions, data =>
  _getBucket(data.cluster, data.label)
);

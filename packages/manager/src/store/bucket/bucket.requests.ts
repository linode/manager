import {
  createBucket as _createBucket,
  deleteBucket as _deleteBucket,
  getBuckets as _getBuckets,
  getBucketsForCluster,
  ObjectStorageBucket,
  ObjectStorageBucketRequestPayload,
  ObjectStorageDeleteBucketRequestPayload
} from 'linode-js-sdk/lib/object-storage';
import { APIError } from 'linode-js-sdk/lib/types';
import { flatten } from 'ramda';
import { objectStorageClusterDisplay } from 'src/constants';
import { getAll, GetAllData, getAllWithArguments } from 'src/utilities/getAll';
import { createRequestThunk, requestAndReduce } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import {
  createBucketActions,
  deleteBucketActions,
  getAllBucketsActions,
  getAllBucketsForAllClustersActions
} from './bucket.actions';

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
 * Get all buckets
 */

// The API returns an error if more than 100 Buckets are requested.
const _getAll = getAll<ObjectStorageBucket>(_getBuckets, 100);

const getAllBucketsRequest = () => _getAll().then(({ data }) => data);

export const getAllBuckets = createRequestThunk(
  getAllBucketsActions,
  getAllBucketsRequest
);

const _getAllBucketsInAllClusters = (clusterId: string) =>
  getAllWithArguments<ObjectStorageBucket>(getBucketsForCluster)([clusterId]);

export const getAllBucketsInAllClusters: ThunkActionCreator<void> = () => dispatch => {
  const clusterIds = Object.keys(objectStorageClusterDisplay);

  dispatch(getAllBucketsForAllClustersActions.started());

  requestAndReduce<string, GetAllData<ObjectStorageBucket>>(
    clusterIds,
    _getAllBucketsInAllClusters
  ).then(({ successes, errors }) => {
    if (errors.length > 0) {
      dispatch(
        getAllBucketsForAllClustersActions.failed({ error: flatten(errors) })
      );
    }

    const allData = successes.reduce((acc, curr) => [...acc, ...curr.data], []);

    dispatch(getAllBucketsForAllClustersActions.done({ result: allData }));
  });
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

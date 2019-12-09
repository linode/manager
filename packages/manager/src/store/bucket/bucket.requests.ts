import {
  createBucket as _createBucket,
  deleteBucket as _deleteBucket,
  getBuckets as _getBuckets,
  ObjectStorageBucket,
  ObjectStorageBucketRequestPayload,
  ObjectStorageDeleteBucketRequestPayload
} from 'linode-js-sdk/lib/object-storage';
import { APIError } from 'linode-js-sdk/lib/types';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import {
  createBucketActions,
  deleteBucketActions,
  getAllBucketsActions
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
 * Get All Buckets
 */
const _getAll = getAll<ObjectStorageBucket>(_getBuckets);

const getAllBucketsRequest = () => _getAll().then(({ data }) => data);

export const getAllBuckets = createRequestThunk(
  getAllBucketsActions,
  getAllBucketsRequest
);

/*
 * Delete Bucket
 */
export type DeleteBucketRequest = ObjectStorageDeleteBucketRequestPayload;
export const deleteBucket = createRequestThunk<
  ObjectStorageDeleteBucketRequestPayload,
  {},
  APIError[]
>(deleteBucketActions, data => _deleteBucket(data));

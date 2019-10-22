import {
  Bucket,
  BucketRequestPayload,
  createBucket as _createBucket,
  deleteBucket as _deleteBucket,
  DeleteBucketRequestPayload,
  getBuckets as _getBuckets
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

export type CreateBucketRequest = BucketRequestPayload;
export const createBucket = createRequestThunk<
  CreateBucketRequest,
  Bucket,
  APIError[]
>(createBucketActions, data => _createBucket(data));

/*
 * Get All Buckets
 */
const _getAll = getAll<Bucket>(_getBuckets);

const getAllBucketsRequest = () => _getAll().then(({ data }) => data);

export const getAllBuckets = createRequestThunk(
  getAllBucketsActions,
  getAllBucketsRequest
);

/*
 * Delete Bucket
 */
export type DeleteBucketRequest = DeleteBucketRequestPayload;
export const deleteBucket = createRequestThunk<
  DeleteBucketRequestPayload,
  {},
  APIError[]
>(deleteBucketActions, data => _deleteBucket(data));

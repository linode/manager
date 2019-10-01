import { APIError } from 'linode-js-sdk/lib/types';
import {
  BucketRequestPayload,
  createBucket as _createBucket,
  deleteBucket as _deleteBucket,
  DeleteBucketRequestPayload,
  getBuckets as _getBuckets
} from 'src/services/objectStorage/buckets';
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
  Linode.Bucket,
  APIError[]
>(createBucketActions, data => _createBucket(data));

/*
 * Get All Buckets
 */
const _getAll = getAll<Linode.Bucket>(_getBuckets);

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

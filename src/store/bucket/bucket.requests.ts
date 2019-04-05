import {
  BucketRequestPayload,
  createBucket as _createBucket,
  getBuckets as _getBuckets
} from 'src/services/objectStorage/buckets';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { createBucketActions, getAllBucketsActions } from './bucket.actions';

/*
 * Create Bucket
 */

export type CreateBucketRequest = BucketRequestPayload;
export const createBucket = createRequestThunk<
  CreateBucketRequest,
  Linode.Bucket,
  Linode.ApiFieldError[]
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

import { BETA_API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../request';
import { ResourcePage as Page } from '../types';
import { CreateBucketSchema } from './buckets.schema';
import {
  ObjectStorageBucket,
  ObjectStorageBucketRequestPayload,
  ObjectStorageDeleteBucketRequestPayload,
  ObjectStorageObjectListParams,
  ObjectStorageObjectListResponse
} from './types';

/**
 * getBuckets
 *
 * Gets a list of a user's Object Storage Buckets
 */
export const getBuckets = (params?: any, filters?: any) =>
  Request<Page<ObjectStorageBucket>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${BETA_API_ROOT}/object-storage/buckets`)
  ).then(response => response.data);

/**
 * createBucket
 *
 * Creates a new Bucket on your account.
 *
 * @param data { object } The label and clusterId of the new Bucket.
 *
 */
export const createBucket = (data: ObjectStorageBucketRequestPayload) =>
  Request<ObjectStorageBucket>(
    setURL(`${BETA_API_ROOT}/object-storage/buckets`),
    setMethod('POST'),
    setData(data, CreateBucketSchema)
  ).then(response => response.data);

/**
 * deleteBucket
 *
 * Removes a Bucket from your account.
 *
 * NOTE: Attempting to delete a non-empty bucket will result in an error.
 */
export const deleteBucket = ({
  cluster,
  label
}: ObjectStorageDeleteBucketRequestPayload) =>
  Request<ObjectStorageBucket>(
    setURL(`${BETA_API_ROOT}/object-storage/buckets/${cluster}/${label}`),
    setMethod('DELETE')
  );

/**
 * Returns a list of Objects in a given Bucket.
 */
export const getObjectList = (
  clusterId: string,
  bucketName: string,
  params?: ObjectStorageObjectListParams
) =>
  Request<ObjectStorageObjectListResponse>(
    setMethod('GET'),
    setParams(params),
    setURL(
      `${BETA_API_ROOT}/object-storage/buckets/${clusterId}/${bucketName}/object-list`
    )
  ).then(response => response.data);

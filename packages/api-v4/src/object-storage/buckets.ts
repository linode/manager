import {
  CreateBucketSchema,
  UpdateBucketAccessSchema,
  UploadCertificateSchema,
} from '@linode/validation/lib/buckets.schema';
import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { Filter, Params, ResourcePage as Page } from '../types';
import {
  ObjectStorageBucket,
  ObjectStorageBucketAccessRequest,
  ObjectStorageBucketAccessResponse,
  ObjectStorageBucketRequestPayload,
  ObjectStorageBucketSSLRequest,
  ObjectStorageBucketSSLResponse,
  ObjectStorageDeleteBucketRequestPayload,
  ObjectStorageObjectListParams,
  ObjectStorageObjectListResponse,
} from './types';

/**
 * getBucket
 *
 * Get one Object Storage Bucket.
 */
export const getBucket = (clusterId: string, bucketName: string) =>
  Request<ObjectStorageBucket>(
    setMethod('GET'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        clusterId
      )}/${encodeURIComponent(bucketName)}`
    )
  );

/**
 * getBuckets
 *
 * Gets a list of a user's Object Storage Buckets.
 */
export const getBuckets = (params?: Params, filters?: Filter) =>
  Request<Page<ObjectStorageBucket>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/object-storage/buckets`)
  );

/**
 * getBucketsInCluster
 *
 * Gets a list of a user's Object Storage Buckets in the specified cluster.
 */
export const getBucketsInCluster = (
  clusterId: string,
  params?: Params,
  filters?: Filter
) =>
  Request<Page<ObjectStorageBucket>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(clusterId)}`
    )
  );

/**
 * getBucketsInRegion
 *
 * Gets a list of a user's Object Storage Buckets in the specified region.
 */
export const getBucketsInRegion = (
  regionId: string,
  params?: Params,
  filters?: Filter
) =>
  Request<Page<ObjectStorageBucket>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/object-storage/buckets/${encodeURIComponent(regionId)}`)
  );

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
    setURL(`${API_ROOT}/object-storage/buckets`),
    setMethod('POST'),
    setData(data, CreateBucketSchema)
  );

/**
 * deleteBucket
 *
 * Removes a Bucket from your account.
 *
 * NOTE: Attempting to delete a non-empty bucket will result in an error.
 */
export const deleteBucket = ({
  cluster,
  label,
}: ObjectStorageDeleteBucketRequestPayload) =>
  Request<ObjectStorageBucket>(
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        cluster
      )}/${encodeURIComponent(label)}`
    ),
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
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        clusterId
      )}/${encodeURIComponent(bucketName)}/object-list`
    )
  );

/**
 * uploadSSLCert
 */
export const uploadSSLCert = (
  clusterId: string,
  bucketName: string,
  data: ObjectStorageBucketSSLRequest
) =>
  Request<ObjectStorageBucketSSLResponse>(
    setMethod('POST'),
    setData(data, UploadCertificateSchema),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        clusterId
      )}/${encodeURIComponent(bucketName)}/ssl`
    )
  );

/**
 * getSSLCert
 *
 * Returns { ssl: true } if there is an SSL certificate available for
 * the specified bucket, { ssl: false } otherwise.
 */
export const getSSLCert = (clusterId: string, bucketName: string) =>
  Request<ObjectStorageBucketSSLResponse>(
    setMethod('GET'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        clusterId
      )}/${encodeURIComponent(bucketName)}/ssl`
    )
  );

/**
 * deleteSSLCert
 *
 * Removes any SSL cert associated with the specified bucket. Certs are
 * removed automatically when a bucket is deleted; this endpoint is only
 * for removing certs without altering the bucket.
 */
export const deleteSSLCert = (clusterId: string, bucketName: string) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        clusterId
      )}/${encodeURIComponent(bucketName)}/ssl`
    )
  );

/**
 * getBucketAccess
 *
 * Returns access information (ACL, CORS) for a given Bucket.
 */
export const getBucketAccess = (clusterId: string, bucketName: string) =>
  Request<ObjectStorageBucketAccessResponse>(
    setMethod('GET'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        clusterId
      )}/${encodeURIComponent(bucketName)}/access`
    )
  );

/**
 * updateBucketAccess
 *
 * Updates access information (ACL, CORS) for a given Bucket.
 */
export const updateBucketAccess = (
  clusterId: string,
  bucketName: string,
  data: ObjectStorageBucketAccessRequest
) =>
  Request<{}>(
    setMethod('PUT'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        clusterId
      )}/${encodeURIComponent(bucketName)}/access`
    ),
    setData(data, UpdateBucketAccessSchema)
  );

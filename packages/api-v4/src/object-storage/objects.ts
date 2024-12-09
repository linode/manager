import { API_ROOT } from '../constants';
import Request, { setData, setMethod, setURL } from '../request';
import {
  ACLType,
  ObjectStorageObjectACL,
  ObjectStorageObjectURL,
  GetObjectStorageACLPayload,
  CreateObjectStorageObjectURLPayload,
} from './types';

/**
 * Creates a pre-signed URL to access a single object in a bucket.
 * Use it to share, create, or delete objects by using the appropriate
 * HTTP method in your request body's method parameter.
 */
export const getObjectURL = (
  clusterId: string,
  bucketName: string,
  name: string,
  method: 'GET' | 'PUT' | 'POST' | 'DELETE',
  options?: CreateObjectStorageObjectURLPayload
) =>
  Request<ObjectStorageObjectURL>(
    setMethod('POST'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        clusterId
      )}/${encodeURIComponent(bucketName)}/object-url`
    ),
    setData({ name, method, ...options })
  );

/**
 *
 * getObjectACL
 *
 * Gets the ACL for a given Object.
 */
export const getObjectACL = ({
  clusterId,
  bucket,
  params,
}: GetObjectStorageACLPayload) =>
  Request<ObjectStorageObjectACL>(
    setMethod('GET'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        clusterId
      )}/${encodeURIComponent(bucket)}/object-acl?name=${encodeURIComponent(
        params.name
      )}`
    )
  );

/**
 *
 * updateObjectACL
 *
 * Updates the ACL for a given Object.
 */
export const updateObjectACL = (
  clusterId: string,
  bucketName: string,
  name: string,
  acl: Omit<ACLType, 'custom'>
) =>
  Request<{}>(
    setMethod('PUT'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        clusterId
      )}/${encodeURIComponent(bucketName)}/object-acl`
    ),
    setData({ acl, name })
  );

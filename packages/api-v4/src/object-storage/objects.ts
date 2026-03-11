import { API_ROOT } from '../constants';
import Request, { setData, setMethod, setURL } from '../request';

import type {
  ACLType,
  CreateObjectStorageObjectURLPayload,
  GetObjectStorageACLPayload,
  ObjectStorageObjectACL,
  ObjectStorageObjectURL,
} from './types';

/**
 * Creates a pre-signed URL to access a single object in a bucket.
 * Use it to share, create, or delete objects by using the appropriate
 * HTTP method in your request body's method parameter.
 */
export const getObjectURL = (
  regionId: string,
  bucket: string,
  name: string,
  method: 'DELETE' | 'GET' | 'POST' | 'PUT',
  options?: CreateObjectStorageObjectURLPayload,
) =>
  Request<ObjectStorageObjectURL>(
    setMethod('POST'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        regionId,
      )}/${encodeURIComponent(bucket)}/object-url`,
    ),
    setData({ name, method, ...options }),
  );

/**
 *
 * getObjectACL
 *
 * Gets the ACL for a given Object.
 */
export const getObjectACL = ({
  regionId,
  bucket,
  params,
}: GetObjectStorageACLPayload) =>
  Request<ObjectStorageObjectACL>(
    setMethod('GET'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        regionId,
      )}/${encodeURIComponent(bucket)}/object-acl?name=${encodeURIComponent(
        params.name,
      )}`,
    ),
  );

/**
 *
 * updateObjectACL
 *
 * Updates the ACL for a given Object.
 */
export const updateObjectACL = (
  regionId: string,
  bucketName: string,
  name: string,
  acl: Omit<ACLType, 'custom'>,
) =>
  Request<{}>(
    setMethod('PUT'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        regionId,
      )}/${encodeURIComponent(bucketName)}/object-acl`,
    ),
    setData({ acl, name }),
  );

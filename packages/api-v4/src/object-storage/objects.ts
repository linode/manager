import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL } from '../request';
import {
  ACLType,
  ObjectStorageObjectACL,
  ObjectStorageObjectURL,
  ObjectStorageObjectURLOptions,
} from './types';

/**
 * Gets a URL to upload/download/delete Objects from a Bucket.
 */
export const getObjectURL = (
  clusterId: string,
  bucketName: string,
  name: string,
  method: 'GET' | 'PUT' | 'POST' | 'DELETE',
  options?: ObjectStorageObjectURLOptions
) =>
  Request<ObjectStorageObjectURL>(
    setMethod('POST'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${clusterId}/${bucketName}/object-url`
    ),
    setData({ name, method, ...options })
  );

/**
 *
 * getObjectACL
 *
 * Gets the ACL for a given Object.
 */
export const getObjectACL = (
  clusterId: string,
  bucketName: string,
  name: string
) =>
  Request<ObjectStorageObjectACL>(
    setMethod('GET'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${clusterId}/${bucketName}/object-acl?name=${name}`
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
  Request<ObjectStorageObjectACL>(
    setMethod('PUT'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${clusterId}/${bucketName}/object-acl`
    ),
    setData({ acl, name })
  );

import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL } from '../request';
import { ObjectStorageObjectURL, ObjectStorageObjectURLOptions } from './types';

/**
 * Gets a URL to upload/download/delete objects from a bucket.
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
 * Gets the ACL for a given object
 */
export const getObjectACL = (
  clusterId: string,
  bucketName: string,
  name: string
) =>
  Request<ObjectStorageObjectURL>(
    setMethod('GET'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${clusterId}/${bucketName}/object-acl?name=${name}`
    )
  );

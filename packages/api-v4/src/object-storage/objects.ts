import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import {
  ACLType,
  ObjectStorageEndpointsResponse,
  ObjectStorageObjectACL,
  ObjectStorageObjectURL,
  ObjectStorageObjectURLOptions,
} from './types';

import type { ResourcePage, RequestOptions } from '../types';

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
export const getObjectACL = (
  clusterId: string,
  bucketName: string,
  name: string
) =>
  Request<ObjectStorageObjectACL>(
    setMethod('GET'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        clusterId
      )}/${encodeURIComponent(bucketName)}/object-acl?name=${encodeURIComponent(
        name
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
  Request<ObjectStorageObjectACL>(
    setMethod('PUT'),
    setURL(
      `${API_ROOT}/object-storage/buckets/${encodeURIComponent(
        clusterId
      )}/${encodeURIComponent(bucketName)}/object-acl`
    ),
    setData({ acl, name })
  );

export const getObjectStorageEndpoints = ({ filter, params }: RequestOptions) =>
  Request<ResourcePage<ObjectStorageEndpointsResponse[]>>(
    setMethod('GET'),
    setURL(`${API_ROOT}/object-storage/endpoints`),
    setParams(params),
    setXFilter(filter)
  );

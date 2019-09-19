import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../request';
import { ResourcePage as Page } from '../types';
import { createObjectStorageKeysSchema } from './objectStorageKeys.schema';
import { ObjectStorageKey } from './types';

export interface ObjectStorageKeyRequest {
  label: string;
}
/**
 * getObjectStorageKeys
 *
 * Gets a list of a user's Object Storage Keys
 */
export const getObjectStorageKeys = (params?: any, filters?: any) =>
  Request<Page<ObjectStorageKey>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}beta/object-storage/keys`)
  ).then(response => response.data);

/**
 * createObjectStorageKeys
 *
 * Creates an Object Storage key
 */
export const createObjectStorageKeys = (data: ObjectStorageKeyRequest) =>
  Request<ObjectStorageKey>(
    setMethod('POST'),
    setURL(`${API_ROOT}beta/object-storage/keys`),
    setData(data, createObjectStorageKeysSchema)
  ).then(response => response.data);

/**
 * updateObjectStorageKeys
 *
 * Updates an Object Storage Key
 */
export const updateObjectStorageKey = (
  id: number,
  data: ObjectStorageKeyRequest
) =>
  Request<ObjectStorageKey>(
    setMethod('PUT'),
    setURL(`${API_ROOT}beta/object-storage/keys/${id}`),
    setData(data, createObjectStorageKeysSchema)
  ).then(response => response.data);

/**
 * revokeObjectStorageKey
 *
 * Revokes an Object Storage key
 */
export const revokeObjectStorageKey = (id: number) =>
  Request<ObjectStorageKey>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}beta/object-storage/keys/${id}`)
  ).then(response => response.data);

import {
  createObjectStorageKeysSchema,
  updateObjectStorageKeysSchema,
} from '@linode/validation/lib/objectStorageKeys.schema';
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
  ObjectStorageKey,
  CreateObjectStorageKeyPayload,
  UpdateObjectStorageKeyPayload,
} from './types';

/**
 * getObjectStorageKeys
 *
 * Gets a list of a user's Object Storage Keys
 */
export const getObjectStorageKeys = (params?: Params, filters?: Filter) =>
  Request<Page<ObjectStorageKey>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/object-storage/keys`)
  );

/**
 * createObjectStorageKeys
 *
 * Creates an Object Storage key
 */
export const createObjectStorageKeys = (data: CreateObjectStorageKeyPayload) =>
  Request<ObjectStorageKey>(
    setMethod('POST'),
    setURL(`${API_ROOT}/object-storage/keys`),
    setData(data, createObjectStorageKeysSchema)
  );

/**
 * updateObjectStorageKeys
 *
 * Updates an Object Storage Key
 */
export const updateObjectStorageKey = (
  id: number,
  data: UpdateObjectStorageKeyPayload
) =>
  Request<ObjectStorageKey>(
    setMethod('PUT'),
    setURL(`${API_ROOT}/object-storage/keys/${encodeURIComponent(id)}`),
    setData(data, updateObjectStorageKeysSchema)
  );

/**
 * revokeObjectStorageKey
 *
 * Revokes an Object Storage key
 */
export const revokeObjectStorageKey = (id: number) =>
  Request<ObjectStorageKey>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}/object-storage/keys/${encodeURIComponent(id)}`)
  );

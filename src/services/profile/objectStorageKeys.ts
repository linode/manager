import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../index';
import { createObjectStorageKeysSchema } from './objectStorageKeys.schema';

type Page<T> = Linode.ResourcePage<T>;
export interface CreateObjectStorageKeyRequest {
  label: string;
}
/**
 * getObjectStorageKeys
 *
 * Gets a list of a user's Object Storage Keys
 */
export const getObjectStorageKeys = (params?: any, filters?: any) =>
  Request<Page<Linode.ObjectStorageKey>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}beta/account/s3-keys`)
  ).then(response => response.data);

/**
 * createObjectStorageKeys
 *
 * Creates an Object Storage key
 */
export const createObjectStorageKeys = (data: CreateObjectStorageKeyRequest) =>
  Request<Linode.ObjectStorageKey>(
    setMethod('POST'),
    setURL(`${API_ROOT}beta/account/s3-keys`),
    setData(data, createObjectStorageKeysSchema)
  ).then(response => response.data);

/**
 * revokeObjectStorageKey
 *
 * Revokes an Object Storage key
 */
export const revokeObjectStorageKey = (id: number) =>
  Request<Linode.ObjectStorageKey>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}beta/account/s3-keys/${id}`)
  ).then(response => response.data);

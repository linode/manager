import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL } from '../index';
import { createObjectStorageKeysSchema } from './objectStorageKeys.schema';

export interface CreateObjectStorageKeysRequest {
  label: string;
}

/**
 * createObjectStorageKeys
 *
 * Creates an Object Storage User and returns the Access Key and Secret Key
 */
export const createObjectStorageKeys = (data: CreateObjectStorageKeysRequest) =>
  Request<{ id: number; keys: Linode.ObjectStorageKeyPair[] }>(
    setMethod('POST'),
    setURL(`${API_ROOT}beta/account/s3-keys`),
    setData(data, createObjectStorageKeysSchema)
  ).then(response => response.data);

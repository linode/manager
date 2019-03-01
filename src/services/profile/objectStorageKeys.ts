import { API_ROOT } from 'src/constants';
import Request, { setMethod, setURL } from '../index';

/**
 * createObjectStorageKeys
 *
 * Creates an Object Storage User and returns the Access Key and Secret Key
 */
export const createObjectStorageKeys = () =>
  Request<{ id: number; keys: Linode.ObjectStorageKeyPair[] }>(
    setMethod('POST'),
    // Yes, this endpoint is v4beta/object-storage
    setURL(`${API_ROOT}beta/object-storage`)
  ).then(response => response.data);

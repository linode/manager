import { BETA_API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL } from '../request';
import { ObjectURL, ObjectURLOptions } from './types';

/**
 * Gets a URL to upload/download/delete objects from a bucket.
 */
export const getObjectURL = (
  clusterId: string,
  bucketName: string,
  name: string,
  method: 'GET' | 'PUT' | 'POST' | 'DELETE',
  options?: ObjectURLOptions
) =>
  Request<ObjectURL>(
    setMethod('POST'),
    setURL(
      `${BETA_API_ROOT}/object-storage/buckets/${clusterId}/${bucketName}/object-url`
    ),
    setData({ name, method, ...options })
  ).then(response => response.data);

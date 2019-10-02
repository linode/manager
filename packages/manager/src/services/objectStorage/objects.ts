import { BETA_API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL } from '../index';

interface ObjectURLOptions {
  expires_in?: number;
  // "Content-Type" is normally an HTTP header, but here it is used in the body
  // of a request to /object-url, to inform the API which kind of file it is
  // we're trying to upload.
  content_type?: string;
}

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
  Request<Linode.ObjectURL>(
    setMethod('POST'),
    setURL(
      `${BETA_API_ROOT}/object-storage/buckets/${clusterId}/${bucketName}/object-url`
    ),
    setData({ name, method, ...options })
  ).then(response => response.data);

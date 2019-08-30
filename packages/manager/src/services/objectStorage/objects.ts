import { BETA_API_ROOT } from 'src/constants';
import Request, { setData, setHeaders, setMethod, setURL } from '../index';

interface ObjectURLOptions {
  expires_in?: number;
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

/**
 * Upload Object
 */
export const uploadObject = (url: string, file: File) =>
  Request<any>(
    setMethod('PUT'),
    setURL(url),
    setData(file),
    setHeaders({ 'Content-Type': file.type })
  );

import { API_ROOT } from 'src/constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../index';

type Page<T> = Linode.ResourcePage<T>;

/**
 * getBuckets
 *
 * Gets a list of a user's Object Storage Buckets
 */
export const getBuckets = (params?: any, filters?: any) =>
  Request<Page<Linode.Bucket>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}beta/object-storage/buckets`)
  ).then(response => response.data);

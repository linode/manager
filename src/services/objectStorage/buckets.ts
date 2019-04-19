import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../index';
import { CreateBucketSchema } from './buckets.schema';

type Page<T> = Linode.ResourcePage<T>;

export interface BucketRequestPayload {
  label: string;
  cluster: string;
}

export interface DeleteBucketRequestPayload {
  cluster: string;
  label: string;
}

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

/**
 * createBucket
 *
 * Creates a new Bucket on your account.
 *
 * @param data { object } The label and clusterId of the new Bucket.
 *
 */
export const createBucket = (data: BucketRequestPayload) =>
  Request<Linode.Bucket>(
    setURL(`${API_ROOT}beta/object-storage/buckets`),
    setMethod('POST'),
    setData(data, CreateBucketSchema)
  ).then(response => response.data);

/**
 * deleteBucket
 *
 * Removes a Bucket from your account.
 *
 * @param bucketId { number } The ID of the bucket to delete.
 *
 */
export const deleteBucket = ({ cluster, label }: DeleteBucketRequestPayload) =>
  Request<Linode.Bucket>(
    setURL(`${API_ROOT}beta/object-storage/buckets/${cluster}/${label}`),
    setMethod('DELETE')
  );

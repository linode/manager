import { ResourcePage } from 'linode-js-sdk/lib/types';
import { BETA_API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../index';
import { CreateBucketSchema } from './buckets.schema';

type Page<T> = ResourcePage<T>;

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
    setURL(`${BETA_API_ROOT}/object-storage/buckets`)
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
    setURL(`${BETA_API_ROOT}/object-storage/buckets`),
    setMethod('POST'),
    setData(data, CreateBucketSchema)
  ).then(response => response.data);

/**
 * deleteBucket
 *
 * Removes a Bucket from your account.
 *
 * NOTE: Attempting to delete a non-empty bucket will result in an error.
 */
export const deleteBucket = ({ cluster, label }: DeleteBucketRequestPayload) =>
  Request<Linode.Bucket>(
    setURL(`${BETA_API_ROOT}/object-storage/buckets/${cluster}/${label}`),
    setMethod('DELETE')
  );

export interface ObjectListParams {
  delimiter?: string;
  marker?: string;
  prefix?: string;
  page_size?: number;
}

export interface ObjectListResponse {
  data: Linode.Object[];
  next_marker: string | null;
  is_truncated: boolean;
}
/**
 * Returns a list of Objects in a given Bucket.
 */
export const getObjectList = (
  clusterId: string,
  bucketName: string,
  params?: ObjectListParams
) =>
  Request<ObjectListResponse>(
    setMethod('GET'),
    setParams(params),
    setURL(
      `${BETA_API_ROOT}/object-storage/buckets/${clusterId}/${bucketName}/object-list`
    )
  ).then(response => response.data);

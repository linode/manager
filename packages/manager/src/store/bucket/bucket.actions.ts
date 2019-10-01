import { APIError } from 'linode-js-sdk/lib/types';
import {
  BucketRequestPayload,
  DeleteBucketRequestPayload
} from 'src/services/objectStorage/buckets';
import { actionCreatorFactory } from 'typescript-fsa';

export const actionCreator = actionCreatorFactory('@@manager/buckets');

export const createBucketActions = actionCreator.async<
  BucketRequestPayload,
  Linode.Bucket,
  APIError[]
>(`create`);

export const getAllBucketsActions = actionCreator.async<
  void,
  Linode.Bucket[],
  APIError[]
>('get-all');

export const deleteBucketActions = actionCreator.async<
  DeleteBucketRequestPayload,
  {},
  APIError[]
>('delete');

import {
  Bucket,
  BucketRequestPayload,
  DeleteBucketRequestPayload
} from 'linode-js-sdk/lib/object-storage';
import { APIError } from 'linode-js-sdk/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';

export const actionCreator = actionCreatorFactory('@@manager/buckets');

export const createBucketActions = actionCreator.async<
  BucketRequestPayload,
  Bucket,
  APIError[]
>(`create`);

export const getAllBucketsActions = actionCreator.async<
  void,
  Bucket[],
  APIError[]
>('get-all');

export const deleteBucketActions = actionCreator.async<
  DeleteBucketRequestPayload,
  {},
  APIError[]
>('delete');

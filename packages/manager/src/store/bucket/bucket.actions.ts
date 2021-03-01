import {
  ObjectStorageBucket,
  ObjectStorageBucketRequestPayload,
  ObjectStorageDeleteBucketRequestPayload,
} from '@linode/api-v4/lib/object-storage';
import { APIError } from '@linode/api-v4/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';
import { BucketError } from './types';

export const actionCreator = actionCreatorFactory('@@manager/buckets');

export const createBucketActions = actionCreator.async<
  ObjectStorageBucketRequestPayload,
  ObjectStorageBucket,
  APIError[]
>(`create`);

export const getAllBucketsForAllClustersActions = actionCreator.async<
  void,
  ObjectStorageBucket[],
  BucketError[]
>('get-all-buckets-for-all-clusters');

export const deleteBucketActions = actionCreator.async<
  ObjectStorageDeleteBucketRequestPayload,
  {},
  APIError[]
>('delete');

export const getBucketActions = actionCreator.async<
  ObjectStorageBucketRequestPayload,
  ObjectStorageBucket,
  APIError[]
>('get');

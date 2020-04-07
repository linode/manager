import {
  ObjectStorageBucket,
  ObjectStorageBucketRequestPayload,
  ObjectStorageDeleteBucketRequestPayload
} from 'linode-js-sdk/lib/object-storage';
import { APIError } from 'linode-js-sdk/lib/types';
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

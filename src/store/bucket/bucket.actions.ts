import {
  BucketRequestPayload,
  DeleteBucketRequestPayload
} from 'src/services/objectStorage/buckets';
import { actionCreatorFactory } from 'typescript-fsa';

export const actionCreator = actionCreatorFactory('@@manager/buckets');

export const createBucketActions = actionCreator.async<
  BucketRequestPayload,
  Linode.Bucket,
  Linode.ApiFieldError[]
>(`create`);

export const getAllBucketsActions = actionCreator.async<
  {},
  Linode.Bucket[],
  Linode.ApiFieldError[]
>('get-all');

export const deleteBucketActions = actionCreator.async<
  DeleteBucketRequestPayload,
  {},
  Linode.ApiFieldError[]
>('delete');

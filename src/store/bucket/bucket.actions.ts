import { actionCreatorFactory } from 'typescript-fsa';

export const actionCreator = actionCreatorFactory('@@manager/buckets');

export const getAllBucketsActions = actionCreator.async<
  {},
  Linode.Bucket[],
  Linode.ApiFieldError[]
>('get-all');

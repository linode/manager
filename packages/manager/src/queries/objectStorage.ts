import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { OBJECT_STORAGE_DELIMITER as delimiter } from 'src/constants';
import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import { queryClient, queryPresets } from './base';
import { getAll } from 'src/utilities/getAll';
import {
  createBucket,
  deleteBucket,
  getBuckets,
  getClusters,
  getObjectList,
  getObjectStorageKeys,
  ObjectStorageBucket,
  ObjectStorageBucketRequestPayload,
  ObjectStorageCluster,
  ObjectStorageKey,
  ObjectStorageObjectListResponse,
} from '@linode/api-v4/lib/object-storage';

export const queryKey = 'object-stroage';

/**
 * This getAll is probably overkill for getting all
 * Object Storage clusters (currently there are only 4),
 * but lets use it to be safe.
 */
export const getAllObjectStorageClusters = () =>
  getAll<ObjectStorageCluster>(() => getClusters())().then((data) => data.data);

export const getAllObjectStorageBuckets = () =>
  getAll<ObjectStorageBucket>(() => getBuckets())().then((data) => data.data);

export const useObjectStorageClusters = () =>
  useQuery<ObjectStorageCluster[], APIError[]>(
    `${queryKey}-clusters`,
    getAllObjectStorageClusters,
    queryPresets.oneTimeFetch
  );

export const useObjectStorageBuckets = () =>
  useQuery<ObjectStorageBucket[], APIError[]>(
    `${queryKey}-buckets`,
    getAllObjectStorageBuckets,
    queryPresets.oneTimeFetch
  );

export const useObjectStorageAccessKeys = (params: any) =>
  useQuery<ResourcePage<ObjectStorageKey>, APIError[]>(
    [`${queryKey}-access-keys`, params],
    () => getObjectStorageKeys(params),
    { keepPreviousData: true }
  );

export const useCreateBucketMutation = () => {
  return useMutation<
    ObjectStorageBucket,
    APIError[],
    ObjectStorageBucketRequestPayload
  >(createBucket, {
    onSuccess: (newEntity) => {
      queryClient.setQueryData<ObjectStorageBucket[]>(
        `${queryKey}-buckets`,
        (oldData) => [...(oldData || []), newEntity]
      );
    },
  });
};

export const useDeleteBucketMutation = () => {
  return useMutation<{}, APIError[], { cluster: string; label: string }>(
    (data) => deleteBucket(data),
    {
      onSuccess: (_, variables) => {
        queryClient.setQueryData<ObjectStorageBucket[]>(
          `${queryKey}-buckets`,
          (oldData) => {
            return (
              oldData?.filter(
                (bucket: ObjectStorageBucket) =>
                  !(
                    bucket.cluster === variables.cluster &&
                    bucket.label === variables.label
                  )
              ) || []
            );
          }
        );
      },
    }
  );
};

export const useObjectBucketDetailsInfiniteQuery = (
  cluster: string,
  bucket: string,
  prefix: string
) =>
  useInfiniteQuery<ObjectStorageObjectListResponse, APIError[]>(
    [queryKey, cluster, bucket, prefix],
    ({ pageParam }) =>
      getObjectList(cluster, bucket, { marker: pageParam, delimiter, prefix }),
    {
      getNextPageParam: (lastPage) => lastPage.next_marker,
    }
  );

import {
  createBucket,
  deleteBucket,
  deleteBucketWithRegion,
  deleteSSLCert,
  getBuckets,
  getBucketsInCluster,
  getBucketsInRegion,
  getClusters,
  getObjectList,
  getObjectStorageKeys,
  getObjectStorageTypes,
  getObjectURL,
  getSSLCert,
  uploadSSLCert,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { OBJECT_STORAGE_DELIMITER as delimiter } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';
import { isFeatureEnabledV2 } from 'src/utilities/accountCapabilities';
import { getAll } from 'src/utilities/getAll';

import { useAccount } from './account/account';
import { accountQueries } from './account/queries';
import { queryPresets } from './base';
import { useRegionsQuery } from './regions/regions';

import type {
  CreateObjectStorageBucketPayload,
  CreateObjectStorageBucketSSLPayload,
  CreateObjectStorageObjectURLPayload,
  ObjectStorageBucket,
  ObjectStorageBucketSSL,
  ObjectStorageCluster,
  ObjectStorageKey,
  ObjectStorageObjectList,
  ObjectStorageObjectURL,
  Region,
} from '@linode/api-v4';
import type {
  APIError,
  Params,
  PriceType,
  ResourcePage,
} from '@linode/api-v4/lib/types';

export interface BucketError {
  /*
   @TODO OBJ Multicluster:'region' will become required, and the
   'cluster' field will be deprecated once the feature is fully rolled out in production.
   As part of the process of cleaning up after the 'objMultiCluster' feature flag, we will
   remove 'cluster' and retain 'regions'.
  */
  cluster: ObjectStorageCluster;
  error: APIError[];
  region?: Region;
}

interface BucketsResponse {
  buckets: ObjectStorageBucket[];
  errors: BucketError[];
}

/**
 * This getAll is probably overkill for getting all
 * Object Storage clusters (currently there are only 4),
 * but lets use it to be safe.
 */
export const getAllObjectStorageClusters = () =>
  getAll<ObjectStorageCluster>(() => getClusters())().then((data) => data.data);

export const getAllObjectStorageBuckets = () =>
  getAll<ObjectStorageBucket>(() => getBuckets())().then((data) => data.data);

const getAllObjectStorageTypes = () =>
  getAll<PriceType>((params) => getObjectStorageTypes(params))().then(
    (data) => data.data
  );

export const objectStorageQueries = createQueryKeys('object-storage', {
  accessKeys: (params: Params) => ({
    queryFn: () => getObjectStorageKeys(params),
    queryKey: [params],
  }),
  bucket: (clusterOrRegion: string, bucketName: string) => ({
    contextQueries: {
      objects: {
        queryFn: null,
        queryKey: null,
      },
      ssl: {
        queryFn: () => getSSLCert(clusterOrRegion, bucketName),
        queryKey: null,
      },
    },
    queryKey: [clusterOrRegion, bucketName],
  }),
  buckets: {
    queryFn: () => null, // This is a fake queryFn. Look at `useObjectStorageBuckets` for the actual logic.
    queryKey: null,
  },
  clusters: {
    queryFn: () => getAllObjectStorageClusters(),
    queryKey: null,
  },
  types: {
    queryFn: getAllObjectStorageTypes,
    queryKey: null,
  },
});

export const useObjectStorageClusters = (enabled: boolean = true) =>
  useQuery<ObjectStorageCluster[], APIError[]>({
    ...objectStorageQueries.clusters,
    ...queryPresets.oneTimeFetch,
    enabled,
  });

export const useObjectStorageBuckets = (enabled = true) => {
  const flags = useFlags();
  const { data: account } = useAccount();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  const { data: allRegions } = useRegionsQuery();
  const { data: clusters } = useObjectStorageClusters(
    enabled && !isObjMultiClusterEnabled
  );

  const regions = allRegions?.filter((r) =>
    r.capabilities.includes('Object Storage')
  );

  return useQuery<BucketsResponse, APIError[]>({
    enabled: isObjMultiClusterEnabled
      ? regions !== undefined && enabled
      : clusters !== undefined && enabled,
    queryFn: isObjMultiClusterEnabled
      ? () => getAllBucketsFromRegions(regions)
      : () => getAllBucketsFromClusters(clusters),
    queryKey: objectStorageQueries.buckets.queryKey,
  });
};

export const useObjectStorageAccessKeys = (params: Params) =>
  useQuery<ResourcePage<ObjectStorageKey>, APIError[]>({
    ...objectStorageQueries.accessKeys(params),
    keepPreviousData: true,
  });

export const useCreateBucketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ObjectStorageBucket,
    APIError[],
    CreateObjectStorageBucketPayload
  >({
    mutationFn: createBucket,
    onSuccess(bucket) {
      // Invalidate account settings because object storage will become enabled
      // if a user created their first bucket.
      queryClient.invalidateQueries({
        queryKey: accountQueries.settings.queryKey,
      });

      // Add the new bucket to the cache
      queryClient.setQueryData<BucketsResponse>(
        objectStorageQueries.buckets.queryKey,
        (oldData) => ({
          buckets: [...(oldData?.buckets ?? []), bucket],
          errors: oldData?.errors ?? [],
        })
      );

      // Invalidate buckets and cancel existing requests to GET buckets
      // because a user might create a bucket bfore all buckets have been fetched.
      queryClient.invalidateQueries(
        {
          queryKey: objectStorageQueries.buckets.queryKey,
        },
        {
          cancelRefetch: true,
        }
      );
    },
  });
};

export const useDeleteBucketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { cluster: string; label: string }>({
    mutationFn: deleteBucket,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<BucketsResponse>(
        objectStorageQueries.buckets.queryKey,
        (oldData) => ({
          buckets:
            oldData?.buckets.filter(
              (bucket) =>
                !(
                  bucket.cluster === variables.cluster &&
                  bucket.label === variables.label
                )
            ) ?? [],
          errors: oldData?.errors ?? [],
        })
      );
    },
  });
};

/*
   @TODO OBJ Multicluster: useDeleteBucketWithRegionMutation is a temporary hook,
   once feature is rolled out we replace it with existing useDeleteBucketMutation
   by updating it with region instead of cluster.
  */

export const useDeleteBucketWithRegionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { label: string; region: string }>({
    mutationFn: deleteBucketWithRegion,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<BucketsResponse>(
        objectStorageQueries.buckets.queryKey,
        (oldData) => ({
          buckets:
            oldData?.buckets.filter(
              (bucket: ObjectStorageBucket) =>
                !(
                  bucket.region === variables.region &&
                  bucket.label === variables.label
                )
            ) ?? [],
          errors: oldData?.errors ?? [],
        })
      );
    },
  });
};

export const useObjectBucketDetailsInfiniteQuery = (
  clusterId: string,
  bucket: string,
  prefix: string
) =>
  useInfiniteQuery<ObjectStorageObjectList, APIError[]>({
    getNextPageParam: (lastPage) => lastPage.next_marker,
    queryFn: ({ pageParam }) =>
      getObjectList({
        bucket,
        clusterId,
        params: { delimiter, marker: pageParam, prefix },
      }),
    queryKey: [
      ...objectStorageQueries.bucket(clusterId, bucket)._ctx.objects.queryKey,
      ...prefixToQueryKey(prefix),
    ],
  });

export const getAllBucketsFromClusters = async (
  clusters: ObjectStorageCluster[] | undefined
) => {
  if (clusters === undefined) {
    return { buckets: [], errors: [] } as BucketsResponse;
  }

  const promises = clusters.map((cluster) =>
    getAll<ObjectStorageBucket>((params) =>
      getBucketsInCluster(cluster.id, params)
    )()
      .then((data) => data.data)
      .catch((error) => ({
        cluster,
        error,
      }))
  );

  const data = await Promise.all(promises);

  const bucketsPerCluster = data.filter((item) =>
    Array.isArray(item)
  ) as ObjectStorageBucket[][];

  const buckets = bucketsPerCluster.reduce((acc, val) => acc.concat(val), []);

  const errors = data.filter((item) => !Array.isArray(item)) as BucketError[];

  if (errors.length === clusters.length) {
    throw new Error('Unable to get Object Storage buckets.');
  }

  return { buckets, errors } as BucketsResponse;
};

export const getAllBucketsFromRegions = async (
  regions: Region[] | undefined
) => {
  if (regions === undefined) {
    return { buckets: [], errors: [] } as BucketsResponse;
  }

  const promises = regions.map((region) =>
    getAll<ObjectStorageBucket>((params) =>
      getBucketsInRegion(region.id, params)
    )()
      .then((data) => data.data)
      .catch((error) => ({
        error,
        region,
      }))
  );

  const data = await Promise.all(promises);

  const bucketsPerRegion = data.filter((item) =>
    Array.isArray(item)
  ) as ObjectStorageBucket[][];

  const buckets = bucketsPerRegion.reduce((acc, val) => acc.concat(val), []);

  const errors = data.filter((item) => !Array.isArray(item)) as BucketError[];

  if (errors.length === regions.length) {
    throw new Error('Unable to get Object Storage buckets.');
  }

  return { buckets, errors } as BucketsResponse;
};

/**
 * Used to make a nice React Query queryKey by splitting the prefix
 * by the '/' character.
 *
 * By spreading the result, you can achieve a queryKey that is in the form of:
 * ["object-storage","us-southeast-1","test","testfolder"]
 *
 * @param {string} prefix The Object Stoage prefix path
 * @returns {string[]} a list of paths
 */
export const prefixToQueryKey = (prefix: string) => {
  return prefix.split('/', prefix.split('/').length - 1);
};

export const useCreateObjectUrlMutation = (
  clusterId: string,
  bucketName: string
) =>
  useMutation<
    ObjectStorageObjectURL,
    APIError[],
    {
      method: 'DELETE' | 'GET' | 'POST' | 'PUT';
      name: string;
      options?: CreateObjectStorageObjectURLPayload;
    }
  >({
    mutationFn: ({ method, name, options }) =>
      getObjectURL(clusterId, bucketName, name, method, options),
  });

export const useBucketSSLQuery = (cluster: string, bucket: string) =>
  useQuery(objectStorageQueries.bucket(cluster, bucket)._ctx.ssl);

export const useBucketSSLMutation = (cluster: string, bucket: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ObjectStorageBucketSSL,
    APIError[],
    CreateObjectStorageBucketSSLPayload
  >({
    mutationFn: (data) => uploadSSLCert(cluster, bucket, data),
    onSuccess(data) {
      queryClient.setQueryData<ObjectStorageBucketSSL>(
        objectStorageQueries.bucket(cluster, bucket)._ctx.ssl.queryKey,
        data
      );
    },
  });
};

export const useBucketSSLDeleteMutation = (cluster: string, bucket: string) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteSSLCert(cluster, bucket),
    onSuccess() {
      queryClient.setQueryData<ObjectStorageBucketSSL>(
        objectStorageQueries.bucket(cluster, bucket)._ctx.ssl.queryKey,
        { ssl: false }
      );
    },
  });
};

export const useObjectStorageTypesQuery = (enabled = true) =>
  useQuery<PriceType[], APIError[]>({
    ...objectStorageQueries.types,
    ...queryPresets.oneTimeFetch,
    enabled,
  });

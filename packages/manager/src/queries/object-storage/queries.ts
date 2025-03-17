import {
  cancelObjectStorage,
  createBucket,
  deleteBucket,
  deleteBucketWithRegion,
  deleteSSLCert,
  getBucketAccess,
  getObjectACL,
  getObjectList,
  getObjectStorageKeys,
  getObjectURL,
  getSSLCert,
  updateBucketAccess,
  updateObjectACL,
  uploadSSLCert,
} from '@linode/api-v4';
import {
  accountQueries,
  queryPresets,
  updateAccountSettingsData,
  useAccount,
  useRegionsQuery,
} from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { OBJECT_STORAGE_DELIMITER as delimiter } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';

import {
  getAllBucketsFromClusters,
  getAllBucketsFromEndpoints,
  getAllBucketsFromRegions,
  getAllObjectStorageClusters,
  getAllObjectStorageEndpoints,
  getAllObjectStorageTypes,
} from './requests';
import { prefixToQueryKey } from './utilities';

import type { BucketsResponse, BucketsResponseType } from './requests';
import type {
  ACLType,
  APIError,
  CreateObjectStorageBucketPayload,
  CreateObjectStorageBucketSSLPayload,
  CreateObjectStorageObjectURLPayload,
  ObjectStorageBucket,
  ObjectStorageBucketAccess,
  ObjectStorageBucketSSL,
  ObjectStorageCluster,
  ObjectStorageEndpoint,
  ObjectStorageKey,
  ObjectStorageObjectACL,
  ObjectStorageObjectList,
  ObjectStorageObjectURL,
  Params,
  PriceType,
  ResourcePage,
  UpdateObjectStorageBucketAccessPayload,
} from '@linode/api-v4';

export const objectStorageQueries = createQueryKeys('object-storage', {
  accessKeys: (params: Params) => ({
    queryFn: () => getObjectStorageKeys(params),
    queryKey: [params],
  }),
  bucket: (clusterOrRegion: string, bucketName: string) => ({
    contextQueries: {
      access: {
        queryFn: () => getBucketAccess(clusterOrRegion, bucketName),
        queryKey: null,
      },
      objects: {
        contextQueries: {
          acl: (name: string) => ({
            queryFn: () =>
              getObjectACL({
                bucket: bucketName,
                clusterId: clusterOrRegion,
                params: { name },
              }),
            queryKey: [name],
          }),
        },
        // This is a placeholder queryFn and QueryKey. View the `useObjectBucketObjectsInfiniteQuery` implementation for details.
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
    queryFn: () => null, // This is a placeholder queryFn. Look at `useObjectStorageBuckets` for the actual logic.
    queryKey: null,
  },
  clusters: {
    queryFn: getAllObjectStorageClusters,
    queryKey: null,
  },
  endpoints: {
    queryFn: getAllObjectStorageEndpoints,
    queryKey: null,
  },
  types: {
    queryFn: getAllObjectStorageTypes,
    queryKey: null,
  },
});

export const useObjectStorageEndpoints = (enabled = true) => {
  const flags = useFlags();
  const { data: account } = useAccount();

  const isObjectStorageGen2Enabled = isFeatureEnabledV2(
    'Object Storage Endpoint Types',
    Boolean(flags.objectStorageGen2?.enabled),
    account?.capabilities ?? []
  );

  return useQuery<ObjectStorageEndpoint[], APIError[]>({
    ...objectStorageQueries.endpoints,
    ...queryPresets.oneTimeFetch,
    enabled: isObjectStorageGen2Enabled && enabled,
  });
};

/**
 *
 * @deprecated This will be replaced by useObjectStorageEndpoints
 */
export const useObjectStorageClusters = (enabled: boolean = true) =>
  useQuery<ObjectStorageCluster[], APIError[]>({
    ...objectStorageQueries.clusters,
    ...queryPresets.oneTimeFetch,
    enabled,
  });

export const useObjectStorageBuckets = (enabled = true) => {
  const flags = useFlags();
  const { data: account } = useAccount();
  const { data: allRegions } = useRegionsQuery();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  const isObjectStorageGen2Enabled = isFeatureEnabledV2(
    'Object Storage Endpoint Types',
    Boolean(flags.objectStorageGen2?.enabled),
    account?.capabilities ?? []
  );

  const endpointsQueryEnabled = enabled && isObjectStorageGen2Enabled;
  const clustersQueryEnabled = enabled && !isObjMultiClusterEnabled;

  // Endpoints contain all the regions that support Object Storage.
  const { data: endpoints } = useObjectStorageEndpoints(endpointsQueryEnabled);
  const { data: clusters } = useObjectStorageClusters(clustersQueryEnabled);

  const regions =
    isObjMultiClusterEnabled && !isObjectStorageGen2Enabled
      ? allRegions?.filter((r) => r.capabilities.includes('Object Storage'))
      : undefined;

  const queryEnabled =
    enabled &&
    ((isObjectStorageGen2Enabled && Boolean(endpoints)) ||
      (isObjMultiClusterEnabled && Boolean(regions)) ||
      Boolean(clusters));

  const queryFn = isObjectStorageGen2Enabled
    ? () => getAllBucketsFromEndpoints(endpoints)
    : isObjMultiClusterEnabled
    ? () => getAllBucketsFromRegions(regions)
    : () => getAllBucketsFromClusters(clusters);

  return useQuery<
    BucketsResponseType<typeof isObjectStorageGen2Enabled>,
    APIError[]
  >({
    enabled: queryEnabled,
    queryFn,
    queryKey: objectStorageQueries.buckets.queryKey,
    retry: false,
  });
};

export const useObjectStorageAccessKeys = (params: Params) =>
  useQuery<ResourcePage<ObjectStorageKey>, APIError[]>({
    ...objectStorageQueries.accessKeys(params),
    placeholderData: keepPreviousData,
  });

export const useBucketAccess = (
  clusterOrRegion: string,
  bucket: string,
  queryEnabled: boolean
) =>
  useQuery<ObjectStorageBucketAccess, APIError[]>({
    ...objectStorageQueries.bucket(clusterOrRegion, bucket)._ctx.access,
    enabled: queryEnabled,
  });

export const useObjectAccess = (
  bucket: string,
  clusterId: string,
  params: { name: string },
  queryEnabled: boolean
) =>
  useQuery<ObjectStorageObjectACL, APIError[]>({
    enabled: queryEnabled,
    ...objectStorageQueries
      .bucket(clusterId, bucket)
      ._ctx.objects._ctx.acl(params.name),
  });

export const useUpdateBucketAccessMutation = (
  clusterOrRegion: string,
  bucket: string
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], UpdateObjectStorageBucketAccessPayload>({
    mutationFn: (data) => updateBucketAccess(clusterOrRegion, bucket, data),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<ObjectStorageBucketAccess>(
        objectStorageQueries.bucket(clusterOrRegion, bucket)._ctx.access
          .queryKey,
        (oldData) => ({
          acl: variables?.acl ?? 'private',
          acl_xml: oldData?.acl_xml ?? '',
          cors_enabled: variables?.cors_enabled ?? null,
          cors_xml: oldData?.cors_xml ?? null,
        })
      );
    },
  });
};

export const useUpdateObjectAccessMutation = (
  clusterId: string,
  bucketName: string,
  name: string
) => {
  const queryClient = useQueryClient();

  const options = queryOptions(
    objectStorageQueries
      .bucket(clusterId, bucketName)
      ._ctx.objects._ctx.acl(name)
  );

  return useMutation<{}, APIError[], ACLType>({
    mutationFn: (data) => updateObjectACL(clusterId, bucketName, name, data),
    onSuccess(_, acl) {
      queryClient.setQueryData(options.queryKey, (oldData) => ({
        acl,
        acl_xml: oldData?.acl_xml ?? null,
      }));
    },
  });
};

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

export const getObjectBucketObjectsQueryKey = (
  clusterId: string,
  bucket: string,
  prefix: string
) => [
  ...objectStorageQueries.bucket(clusterId, bucket)._ctx.objects.queryKey,
  ...prefixToQueryKey(prefix),
];

export const useObjectBucketObjectsInfiniteQuery = (
  clusterId: string,
  bucket: string,
  prefix: string
) =>
  useInfiniteQuery<ObjectStorageObjectList, APIError[]>({
    getNextPageParam: (lastPage) => lastPage.next_marker,
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      getObjectList({
        bucket,
        clusterId,
        params: { delimiter, marker: pageParam as string | undefined, prefix },
      }),
    queryKey: getObjectBucketObjectsQueryKey(clusterId, bucket, prefix),
  });

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
  useQuery<ObjectStorageBucketSSL, APIError[]>(
    objectStorageQueries.bucket(cluster, bucket)._ctx.ssl
  );

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

export const useCancelObjectStorageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>({
    mutationFn: cancelObjectStorage,
    onSuccess() {
      updateAccountSettingsData({ object_storage: 'disabled' }, queryClient);
      queryClient.invalidateQueries({
        queryKey: objectStorageQueries.buckets.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: objectStorageQueries.accessKeys._def,
      });
    },
  });
};

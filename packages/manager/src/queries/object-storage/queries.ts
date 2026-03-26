import {
  cancelObjectStorage,
  createBucket,
  createObjectStorageKeys,
  deleteBucket,
  deleteBucketWithRegion,
  deleteSSLCert,
  getBucketAccess,
  getObjectACL,
  getObjectList,
  getObjectStorageKeys,
  getObjectURL,
  getSSLCert,
  revokeObjectStorageKey,
  updateBucketAccess,
  updateObjectACL,
  updateObjectStorageKey,
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
  sendCreateAccessKeyEvent,
  sendEditAccessKeyEvent,
  sendRevokeAccessKeyEvent,
} from 'src/utilities/analytics/customEventAnalytics';

import {
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
  CreateObjectStorageKeyPayload,
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
  UpdateObjectStorageKeyPayload,
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

/**
 * Object Storage Access Keys
 */

export const useObjectStorageAccessKeys = (params: Params) =>
  useQuery<ResourcePage<ObjectStorageKey>, APIError[]>({
    ...objectStorageQueries.accessKeys(params),
    placeholderData: keepPreviousData,
  });

// TODO: Optimize to use tanstack cache
export const useObjectStorageAccessKey = (id: number) => {
  const queryClient = useQueryClient();

  if (id === -1) {
    return {};
  }

  const queries = queryClient.getQueriesData({
    queryKey: objectStorageQueries.accessKeys._def,
  });

  for (const [, data] of queries) {
    const accessKey = (data as ResourcePage<ObjectStorageKey>)?.data?.find(
      (key) => key.id === id
    );
    if (accessKey) {
      return { data: accessKey };
    }
  }

  return { data: undefined };
};

export const useCreateAccessKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ObjectStorageKey,
    APIError[],
    CreateObjectStorageKeyPayload
  >({
    mutationFn: createObjectStorageKeys,
    onSuccess() {
      // Invalidate account settings because object storage will become enabled
      // if a user created their first bucket.
      queryClient.invalidateQueries({
        queryKey: accountQueries.settings.queryKey,
      });

      // Invalidate access keys query
      queryClient.invalidateQueries({
        queryKey: objectStorageQueries.accessKeys._def,
      });

      // @analytics
      sendCreateAccessKeyEvent();
    },
    onError() {
      // We also need to refresh account settings on failure, since, depending
      // on the error, Object Storage service might have actually been enabled.
      queryClient.invalidateQueries({
        queryKey: accountQueries.settings.queryKey,
      });
    },
  });
};

export const useUpdateAccessKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ObjectStorageKey,
    APIError[],
    { data: UpdateObjectStorageKeyPayload; id: number }
  >({
    mutationFn: ({ id, data }) => updateObjectStorageKey(id, data),
    onSuccess() {
      // Invalidate access keys query
      queryClient.invalidateQueries({
        queryKey: objectStorageQueries.accessKeys._def,
      });

      // @analytics
      sendEditAccessKeyEvent();
    },
  });
};

export const useDeleteAccessKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ObjectStorageKey, APIError[], number>({
    mutationFn: (id) => revokeObjectStorageKey(id),
    onSuccess() {
      // Invalidate access keys query
      queryClient.invalidateQueries({
        queryKey: objectStorageQueries.accessKeys._def,
      });

      // @analytics
      sendRevokeAccessKeyEvent();
    },
  });
};

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

export const useObjectStorageBuckets = (enabled: boolean = true) => {
  const flags = useFlags();
  const { data: account, isLoading: accountIsLoading } = useAccount(enabled);

  // TODO: always use regions query once dynamic Object Storage capability resolution is enabled
  const isObjectStorageGen2Enabled =
    account === undefined
      ? undefined
      : isFeatureEnabledV2(
          'Object Storage Endpoint Types',
          Boolean(flags.objectStorageGen2?.enabled),
          account.capabilities ?? []
        );
  const endpointsQueryEnabled = enabled && isObjectStorageGen2Enabled === true;
  const regionsQueryEnabled = enabled && isObjectStorageGen2Enabled === false;

  const { data: allRegions, isLoading: regionsAreLoading } =
    useRegionsQuery(regionsQueryEnabled);
  const objRegions = allRegions?.filter((r) =>
    r.capabilities.includes('Object Storage')
  );

  // Endpoints contain all the regions that support Object Storage.
  const { data: endpoints, isLoading: endpointsAreLoading } =
    useObjectStorageEndpoints(endpointsQueryEnabled);

  const bucketsQueryEnabled =
    (endpointsQueryEnabled && Boolean(endpoints)) ||
    (regionsQueryEnabled && Boolean(objRegions));
  const queryFn = endpointsQueryEnabled
    ? () => getAllBucketsFromEndpoints(endpoints)
    : () => getAllBucketsFromRegions(objRegions);

  const dependencyIsLoading =
    accountIsLoading || regionsAreLoading || endpointsAreLoading;

  const bucketsQuery = useQuery<
    BucketsResponseType<typeof isObjectStorageGen2Enabled>
  >({
    enabled: bucketsQueryEnabled,
    queryFn,
    queryKey: objectStorageQueries.buckets.queryKey,
    retry: false,
  });
  return {
    ...bucketsQuery,
    isLoading: bucketsQuery.isLoading || dependencyIsLoading,
  };
};

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

import {
  cancelObjectStorage,
  createBucket,
  deleteBucket,
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
  getAllBucketsFromEndpoints,
  getAllBucketsFromRegions,
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
  bucket: (regionId: string, bucketName: string) => ({
    contextQueries: {
      access: {
        queryFn: () => getBucketAccess(regionId, bucketName),
        queryKey: null,
      },
      objects: {
        contextQueries: {
          acl: (name: string) => ({
            queryFn: () =>
              getObjectACL({
                bucket: bucketName,
                regionId,
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
        queryFn: () => getSSLCert(regionId, bucketName),
        queryKey: null,
      },
    },
    queryKey: [regionId, bucketName],
  }),
  buckets: {
    queryFn: () => null, // This is a placeholder queryFn. Look at `useObjectStorageBuckets` for the actual logic.
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

export const useObjectStorageAccessKeys = (params: Params) =>
  useQuery<ResourcePage<ObjectStorageKey>, APIError[]>({
    ...objectStorageQueries.accessKeys(params),
    placeholderData: keepPreviousData,
  });

export const useBucketAccess = (
  regionId: string,
  bucket: string,
  queryEnabled: boolean
) =>
  useQuery<ObjectStorageBucketAccess, APIError[]>({
    ...objectStorageQueries.bucket(regionId, bucket)._ctx.access,
    enabled: queryEnabled,
  });

export const useObjectAccess = (
  bucket: string,
  regionId: string,
  params: { name: string },
  queryEnabled: boolean
) =>
  useQuery<ObjectStorageObjectACL, APIError[]>({
    enabled: queryEnabled,
    ...objectStorageQueries
      .bucket(regionId, bucket)
      ._ctx.objects._ctx.acl(params.name),
  });

export const useUpdateBucketAccessMutation = (
  regionId: string,
  bucket: string
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], UpdateObjectStorageBucketAccessPayload>({
    mutationFn: (data) => updateBucketAccess(regionId, bucket, data),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<ObjectStorageBucketAccess>(
        objectStorageQueries.bucket(regionId, bucket)._ctx.access.queryKey,
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
  regionId: string,
  bucketName: string,
  name: string
) => {
  const queryClient = useQueryClient();

  const options = queryOptions(
    objectStorageQueries
      .bucket(regionId, bucketName)
      ._ctx.objects._ctx.acl(name)
  );

  return useMutation<{}, APIError[], ACLType>({
    mutationFn: (data) => updateObjectACL(regionId, bucketName, name, data),
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
  return useMutation<{}, APIError[], { label: string; regionId: string }>({
    mutationFn: deleteBucket,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<BucketsResponse>(
        objectStorageQueries.buckets.queryKey,
        (oldData) => ({
          buckets:
            oldData?.buckets.filter(
              (bucket: ObjectStorageBucket) =>
                !(
                  bucket.region === variables.regionId &&
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
  regionId: string,
  bucket: string,
  prefix: string
) => [
  ...objectStorageQueries.bucket(regionId, bucket)._ctx.objects.queryKey,
  ...prefixToQueryKey(prefix),
];

export const useObjectBucketObjectsInfiniteQuery = (
  regionId: string,
  bucket: string,
  prefix: string
) =>
  useInfiniteQuery<ObjectStorageObjectList, APIError[]>({
    getNextPageParam: (lastPage) => lastPage.next_marker,
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      getObjectList({
        bucket,
        regionId,
        params: { delimiter, marker: pageParam as string | undefined, prefix },
      }),
    queryKey: getObjectBucketObjectsQueryKey(regionId, bucket, prefix),
  });

export const useCreateObjectUrlMutation = (regionId: string, bucket: string) =>
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
      getObjectURL(regionId, bucket, name, method, options),
  });

export const useBucketSSLQuery = (region: string, bucket: string) =>
  useQuery<ObjectStorageBucketSSL, APIError[]>(
    objectStorageQueries.bucket(region, bucket)._ctx.ssl
  );

export const useBucketSSLMutation = (region: string, bucket: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ObjectStorageBucketSSL,
    APIError[],
    CreateObjectStorageBucketSSLPayload
  >({
    mutationFn: (data) => uploadSSLCert(region, bucket, data),
    onSuccess(data) {
      queryClient.setQueryData<ObjectStorageBucketSSL>(
        objectStorageQueries.bucket(region, bucket)._ctx.ssl.queryKey,
        data
      );
    },
  });
};

export const useBucketSSLDeleteMutation = (
  regionId: string,
  bucket: string
) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteSSLCert(regionId, bucket),
    onSuccess() {
      queryClient.setQueryData<ObjectStorageBucketSSL>(
        objectStorageQueries.bucket(regionId, bucket)._ctx.ssl.queryKey,
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

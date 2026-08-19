import {
  cancelObjectStorage,
  createBucket,
  createObjectStorageKeys,
  deleteBucket,
  deleteSSLCert,
  getBucket,
  getBucketAccess,
  getObjectACL,
  getObjectList,
  getObjectStorageKey,
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
} from '@linode/queries';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';

import { OBJECT_STORAGE_DELIMITER as delimiter } from 'src/constants';
import {
  sendCreateAccessKeyEvent,
  sendEditAccessKeyEvent,
  sendRevokeAccessKeyEvent,
} from 'src/utilities/analytics/customEventAnalytics';

import {
  getAllBucketsInRegion,
  getAllObjectStorageEndpoints,
  getAllObjectStorageTypes,
} from './requests';
import { prefixToQueryKey } from './utilities';

import type { PriceType } from '@akamai/compute-ui-core/api';
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
  ObjectStorageEndpoint,
  ObjectStorageKey,
  ObjectStorageObjectACL,
  ObjectStorageObjectList,
  ObjectStorageObjectURL,
  Params,
  ResourcePage,
  UpdateObjectStorageBucketAccessPayload,
  UpdateObjectStorageKeyPayload,
} from '@linode/api-v4';

export const objectStorageQueries = createQueryKeys('object-storage', {
  accessKeys: (params: Params) => ({
    queryFn: () => getObjectStorageKeys(params),
    queryKey: [params],
  }),
  accessKey: (id: number) => ({
    queryFn: () => getObjectStorageKey(id),
    queryKey: [id],
  }),
  bucket: (regionId: string, bucketName: string) => ({
    contextQueries: {
      access: {
        queryFn: () => getBucketAccess(regionId, bucketName),
        queryKey: null,
      },
      objects: {
        contextQueries: {
          acl: (objectName: string) => ({
            queryFn: () =>
              getObjectACL({
                bucketName,
                regionId,
                params: { objectName },
              }),
            queryKey: [objectName],
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
    queryFn: () => getBucket(regionId, bucketName),
    queryKey: [regionId, bucketName],
  }),
  allBucketsInRegion: (regionId: string) => ({
    queryFn: () => getAllBucketsInRegion(regionId),
    queryKey: [regionId],
  }),
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

export const useObjectStorageAccessKey = (id: number, enabled = true) => {
  const queryClient = useQueryClient();

  return useQuery<ObjectStorageKey, APIError[]>({
    ...objectStorageQueries.accessKey(id),
    enabled,
    initialData() {
      const queries = queryClient.getQueriesData({
        queryKey: objectStorageQueries.accessKeys._def,
      });

      for (const [, data] of queries) {
        const accessKey = (data as ResourcePage<ObjectStorageKey>)?.data?.find(
          (key) => key.id === id
        );
        if (accessKey) {
          return accessKey;
        }
      }

      return undefined;
    },
  });
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
      // Invalidate account settings because creating an Object Storage access
      // key may cause Object Storage to become enabled for the account.
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

      // Invalidate access key query
      queryClient.invalidateQueries({
        queryKey: objectStorageQueries.accessKey._def,
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

export const useObjectStorageEndpointsQuery = (enabled = true) => {
  return useQuery<ObjectStorageEndpoint[], APIError[]>({
    ...objectStorageQueries.endpoints,
    ...queryPresets.oneTimeFetch,
    enabled,
  });
};

/**
 * The array returned from `useQueries` will have the same length and order
 * as the provided `regionIds`. In other words, `queries[idx]` corresponds
 * to `regionIds[idx]`. Each region id produces one result object, even when
 * the query is disabled.
 */
export const useBucketsByRegionQueries = (
  regionIds: string[],
  enabled: boolean = true,
  opts: { retryOnMount?: boolean } = {}
): UseQueryResult<ObjectStorageBucket[], APIError[]>[] => {
  const retryOnMount = opts.retryOnMount ?? true;
  return useQueries({
    queries: regionIds.map((regionId) => ({
      ...objectStorageQueries.allBucketsInRegion(regionId),
      enabled: enabled && Boolean(regionId),
      retryOnMount,
    })),
  });
};

export const useObjectStorageBucket = ({
  bucketName,
  enabled = true,
  regionId,
}: {
  bucketName: string;
  enabled: boolean;
  regionId: string;
}) => {
  const queryClient = useQueryClient();

  return useQuery<ObjectStorageBucket, APIError[]>({
    ...objectStorageQueries.bucket(regionId, bucketName),
    enabled,
    initialData() {
      const queries = queryClient.getQueriesData({
        queryKey: objectStorageQueries.allBucketsInRegion(regionId).queryKey,
      });

      for (const [, data] of queries) {
        const bucket = (data as ObjectStorageBucket[])?.find(
          (bucket) => bucket.region === regionId && bucket.label === bucketName
        );
        if (bucket) {
          return bucket;
        }
      }

      return undefined;
    },
  });
};

export const useBucketAccess = (
  regionId: string,
  bucketName: string,
  queryEnabled: boolean
) =>
  useQuery<ObjectStorageBucketAccess, APIError[]>({
    ...objectStorageQueries.bucket(regionId, bucketName)._ctx.access,
    enabled: queryEnabled,
  });

export const useObjectAccess = (
  bucketName: string,
  regionId: string,
  params: { objectName: string },
  queryEnabled: boolean
) =>
  useQuery<ObjectStorageObjectACL, APIError[]>({
    enabled: queryEnabled,
    ...objectStorageQueries
      .bucket(regionId, bucketName)
      ._ctx.objects._ctx.acl(params.objectName),
  });

export const useUpdateBucketAccessMutation = (
  regionId: string,
  bucketName: string
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], UpdateObjectStorageBucketAccessPayload>({
    mutationFn: (data) => updateBucketAccess(regionId, bucketName, data),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<ObjectStorageBucketAccess>(
        objectStorageQueries.bucket(regionId, bucketName)._ctx.access.queryKey,
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
  objectName: string
) => {
  const queryClient = useQueryClient();

  const options = queryOptions(
    objectStorageQueries
      .bucket(regionId, bucketName)
      ._ctx.objects._ctx.acl(objectName)
  );

  return useMutation<{}, APIError[], ACLType>({
    mutationFn: (data) =>
      updateObjectACL(regionId, bucketName, objectName, data),
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

      // add endpoint if needed
      queryClient.setQueryData<ObjectStorageEndpoint[]>(
        objectStorageQueries.endpoints.queryKey,
        (oldEndpoints) => {
          const endpointAlreadyExists = oldEndpoints?.some(
            (endpoint) => endpoint.s3_endpoint === bucket.s3_endpoint
          );
          if (
            endpointAlreadyExists ||
            !bucket.s3_endpoint ||
            !bucket.endpoint_type
          ) {
            return oldEndpoints;
          }

          const newEndpoint: ObjectStorageEndpoint = {
            region: bucket.region,
            s3_endpoint: bucket.s3_endpoint,
            endpoint_type: bucket.endpoint_type,
          };

          return [...(oldEndpoints ?? []), newEndpoint];
        }
      );

      // Invalidate endpoints query because creating a bucket may cause new endpoints to become available.
      queryClient.invalidateQueries({
        queryKey: objectStorageQueries.endpoints.queryKey,
      });

      // Add the new bucket to the cache
      queryClient.setQueryData<ObjectStorageBucket[]>(
        objectStorageQueries.allBucketsInRegion(bucket.region).queryKey,
        (oldData) => [...(oldData ?? []), bucket]
      );

      // Invalidate buckets and cancel existing requests to GET buckets
      // because a user might create a bucket before all buckets have been fetched.
      queryClient.invalidateQueries(
        {
          queryKey: objectStorageQueries.allBucketsInRegion(bucket.region)
            .queryKey,
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
  return useMutation<{}, APIError[], { bucketName: string; regionId: string }>({
    mutationFn: deleteBucket,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<ObjectStorageBucket[]>(
        objectStorageQueries.allBucketsInRegion(variables.regionId).queryKey,
        (oldData) =>
          oldData?.filter(
            (bucket: ObjectStorageBucket) =>
              !(
                bucket.region === variables.regionId &&
                bucket.label === variables.bucketName
              )
          ) ?? []
      );
    },
  });
};

export const getObjectBucketObjectsQueryKey = (
  regionId: string,
  bucketName: string,
  prefix: string
) => [
  ...objectStorageQueries.bucket(regionId, bucketName)._ctx.objects.queryKey,
  ...prefixToQueryKey(prefix),
];

export const useObjectBucketObjectsInfiniteQuery = (
  regionId: string,
  bucketName: string,
  prefix: string
) =>
  useInfiniteQuery<ObjectStorageObjectList, APIError[]>({
    getNextPageParam: (lastPage) => lastPage.next_marker,
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      getObjectList({
        bucketName,
        regionId,
        params: { delimiter, marker: pageParam as string | undefined, prefix },
      }),
    queryKey: getObjectBucketObjectsQueryKey(regionId, bucketName, prefix),
  });

export const useCreateObjectUrlMutation = (
  regionId: string,
  bucketName: string
) =>
  useMutation<
    ObjectStorageObjectURL,
    APIError[],
    {
      method: 'DELETE' | 'GET' | 'POST' | 'PUT';
      objectName: string;
      options?: CreateObjectStorageObjectURLPayload;
    }
  >({
    mutationFn: ({ method, objectName, options }) =>
      getObjectURL(regionId, bucketName, objectName, method, options),
  });

export const useBucketSSLQuery = (regionId: string, bucketName: string) =>
  useQuery<ObjectStorageBucketSSL, APIError[]>(
    objectStorageQueries.bucket(regionId, bucketName)._ctx.ssl
  );

export const useBucketSSLMutation = (regionId: string, bucketName: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ObjectStorageBucketSSL,
    APIError[],
    CreateObjectStorageBucketSSLPayload
  >({
    mutationFn: (data) => uploadSSLCert(regionId, bucketName, data),
    onSuccess(data) {
      queryClient.setQueryData<ObjectStorageBucketSSL>(
        objectStorageQueries.bucket(regionId, bucketName)._ctx.ssl.queryKey,
        data
      );
    },
  });
};

export const useBucketSSLDeleteMutation = (
  regionId: string,
  bucketName: string
) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteSSLCert(regionId, bucketName),
    onSuccess() {
      queryClient.setQueryData<ObjectStorageBucketSSL>(
        objectStorageQueries.bucket(regionId, bucketName)._ctx.ssl.queryKey,
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
        queryKey: objectStorageQueries.allBucketsInRegion._def,
      });
      queryClient.invalidateQueries({
        queryKey: objectStorageQueries.accessKeys._def,
      });
    },
  });
};

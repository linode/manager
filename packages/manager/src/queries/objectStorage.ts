import {
  ObjectStorageBucket,
  ObjectStorageBucketRequestPayload,
  ObjectStorageBucketSSLRequest,
  ObjectStorageBucketSSLResponse,
  ObjectStorageCluster,
  ObjectStorageKey,
  ObjectStorageObjectListResponse,
  ObjectStorageObjectURL,
  ObjectStorageObjectURLOptions,
  Region,
  createBucket,
  deleteBucket,
  deleteSSLCert,
  getBucket,
  getBuckets,
  getBucketsInCluster,
  getBucketsInRegion,
  getClusters,
  getObjectList,
  getObjectStorageKeys,
  getObjectURL,
  getSSLCert,
  uploadSSLCert,
} from '@linode/api-v4';
import { APIError, Params, ResourcePage } from '@linode/api-v4/lib/types';
import {
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import { OBJECT_STORAGE_DELIMITER as delimiter } from 'src/constants';
import { getAll } from 'src/utilities/getAll';

import { queryKey as accountSettingsQueryKey } from './accountSettings';
import { queryPresets } from './base';

export interface BucketError {
  /*
   @TODO OBJ Multicluster: 'region' will become required, and the 'cluster' field will be deprecated
   once the feature is fully rolled out in production as part of the process of cleaning up the 'objMultiCluster'
   feature flag.
  */
  cluster: ObjectStorageCluster;
  error: APIError[];
  region?: Region;
}

interface BucketsResponce {
  buckets: ObjectStorageBucket[];
  errors: BucketError[];
}

export const queryKey = 'object-storage';

/**
 * This getAll is probably overkill for getting all
 * Object Storage clusters (currently there are only 4),
 * but lets use it to be safe.
 */
export const getAllObjectStorageClusters = () =>
  getAll<ObjectStorageCluster>(() => getClusters())().then((data) => data.data);

export const getAllObjectStorageBuckets = () =>
  getAll<ObjectStorageBucket>(() => getBuckets())().then((data) => data.data);

export const useObjectStorageClusters = (enabled: boolean = true) =>
  useQuery<ObjectStorageCluster[], APIError[]>(
    `${queryKey}-clusters`,
    getAllObjectStorageClusters,
    { ...queryPresets.oneTimeFetch, enabled }
  );

export const useObjectStorageBuckets = (
  clusters: ObjectStorageCluster[] | undefined,
  enabled: boolean = true
) =>
  useQuery<BucketsResponce, APIError[]>(
    `${queryKey}-buckets`,
    // Ideally we would use the line below, but if a cluster is down, the buckets on that
    // cluster don't show up in the responce. We choose to fetch buckets per-cluster so
    // we can tell the user which clusters are having issues.
    // getAllObjectStorageBuckets,
    () => getAllBucketsFromClusters(clusters),
    {
      ...queryPresets.longLived,
      enabled: clusters !== undefined && enabled,
      retry: false,
    }
  );

export const useObjectStorageBucketsFromRegions = (
  regions: Region[] | undefined,
  enabled: boolean = true
) =>
  useQuery<BucketsResponce, APIError[]>(
    `${queryKey}-buckets-from-regions`,
    () => getAllBucketsFromRegions(regions),
    {
      ...queryPresets.longLived,
      enabled: regions !== undefined && enabled,
      retry: false,
    }
  );

export const useObjectStorageAccessKeys = (params: Params) =>
  useQuery<ResourcePage<ObjectStorageKey>, APIError[]>(
    [`${queryKey}-access-keys`, params],
    () => getObjectStorageKeys(params),
    { keepPreviousData: true }
  );

export const useCreateBucketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ObjectStorageBucket,
    APIError[],
    ObjectStorageBucketRequestPayload
  >(createBucket, {
    onSuccess: (newEntity) => {
      // Invalidate account settings because it contains obj information
      queryClient.invalidateQueries(accountSettingsQueryKey);
      queryClient.setQueryData<BucketsResponce>(
        `${queryKey}-buckets`,
        (oldData) => ({
          buckets: [...(oldData?.buckets || []), newEntity],
          errors: oldData?.errors || [],
        })
      );
    },
  });
};

export const useDeleteBucketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { cluster: string; label: string }>(
    (data) => deleteBucket(data),
    {
      onSuccess: (_, variables) => {
        queryClient.setQueryData<BucketsResponce>(
          `${queryKey}-buckets`,
          (oldData) => {
            return {
              buckets:
                oldData?.buckets.filter(
                  (bucket: ObjectStorageBucket) =>
                    !(
                      bucket.cluster === variables.cluster &&
                      bucket.label === variables.label
                    )
                ) || [],
              errors: oldData?.errors || [],
            };
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
    [queryKey, cluster, bucket, 'objects', ...prefixToQueryKey(prefix)],
    ({ pageParam }) =>
      getObjectList(cluster, bucket, { delimiter, marker: pageParam, prefix }),
    {
      getNextPageParam: (lastPage) => lastPage.next_marker,
    }
  );

export const getAllBucketsFromClusters = async (
  clusters: ObjectStorageCluster[] | undefined
) => {
  if (clusters === undefined) {
    return { buckets: [], errors: [] } as BucketsResponce;
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

  return { buckets, errors } as BucketsResponce;
};

export const getAllBucketsFromRegions = async (
  regions: Region[] | undefined
) => {
  if (regions === undefined) {
    return { buckets: [], errors: [] } as BucketsResponce;
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

  const bucketsPerCluster = data.filter((item) =>
    Array.isArray(item)
  ) as ObjectStorageBucket[][];

  const buckets = bucketsPerCluster.reduce((acc, val) => acc.concat(val), []);

  const errors = data.filter((item) => !Array.isArray(item)) as BucketError[];

  if (errors.length === regions.length) {
    throw new Error('Unable to get Object Storage buckets.');
  }

  return { buckets, errors } as BucketsResponce;
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

/**
 * Updates the data for a single bucket in the useObjectStorageBuckets query
 * @param {string} cluster the id of the Object Storage cluster
 * @param {string} bucketName the label of the bucket
 */
export const updateBucket = async (
  cluster: string,
  bucketName: string,
  queryClient: QueryClient
) => {
  const bucket = await getBucket(cluster, bucketName);
  queryClient.setQueryData<BucketsResponce | undefined>(
    `${queryKey}-buckets`,
    (oldData) => {
      if (oldData === undefined) {
        return undefined;
      }

      const idx = oldData.buckets.findIndex(
        (thisBucket) =>
          thisBucket.label === bucketName && thisBucket.cluster === cluster
      );

      if (idx === -1) {
        return oldData;
      }

      const updatedBuckets = [...oldData.buckets];

      updatedBuckets[idx] = bucket;

      return {
        buckets: updatedBuckets,
        errors: oldData.errors,
      } as BucketsResponce;
    }
  );
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
      options?: ObjectStorageObjectURLOptions;
    }
  >(({ method, name, options }) =>
    getObjectURL(clusterId, bucketName, name, method, options)
  );

export const useBucketSSLQuery = (cluster: string, bucket: string) =>
  useQuery([queryKey, cluster, bucket, 'ssl'], () =>
    getSSLCert(cluster, bucket)
  );

export const useBucketSSLMutation = (cluster: string, bucket: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ObjectStorageBucketSSLResponse,
    APIError[],
    ObjectStorageBucketSSLRequest
  >((data) => uploadSSLCert(cluster, bucket, data), {
    onSuccess(data) {
      queryClient.setQueryData<ObjectStorageBucketSSLResponse>(
        [queryKey, cluster, bucket, 'ssl'],
        data
      );
    },
  });
};

export const useBucketSSLDeleteMutation = (cluster: string, bucket: string) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>(() => deleteSSLCert(cluster, bucket), {
    onSuccess() {
      queryClient.setQueryData<ObjectStorageBucketSSLResponse>(
        [queryKey, cluster, bucket, 'ssl'],
        { ssl: false }
      );
    },
  });
};

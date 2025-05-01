import {
  getBuckets,
  getBucketsInCluster,
  getBucketsInRegion,
  getClusters,
  getObjectStorageEndpoints,
  getObjectStorageTypes,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type {
  APIError,
  ObjectStorageBucket,
  ObjectStorageCluster,
  ObjectStorageEndpoint,
  PriceType,
  Region,
} from '@linode/api-v4';

/**
 * @deprecated This will be replaced with `getAllObjectStorageEndpoints` when OBJ Gen2 is in GA.
 */
export const getAllObjectStorageClusters = () =>
  getAll<ObjectStorageCluster>(() => getClusters())().then((data) => data.data);

export const getAllObjectStorageBuckets = () =>
  getAll<ObjectStorageBucket>(() => getBuckets())().then((data) => data.data);

export const getAllObjectStorageTypes = () =>
  getAll<PriceType>((params) => getObjectStorageTypes(params))().then(
    (data) => data.data
  );

export const getAllObjectStorageEndpoints = () =>
  getAll<ObjectStorageEndpoint>((params, filter) =>
    getObjectStorageEndpoints({ filter, params })
  )().then((data) => data.data);

/**
 * @deprecated This type will be deprecated and removed when OBJ Gen2 is in GA.
 */
export interface BucketError {
  cluster: ObjectStorageCluster;
  error: APIError[];
  region?: Region;
}

/**
 * @deprecated This type will be deprecated and removed when OBJ Gen2 is in GA.
 */
export interface BucketsResponse {
  buckets: ObjectStorageBucket[];
  errors: BucketError[];
}

// TODO: OBJGen2 - Remove the `Gen2` suffix when Gen2 is in GA.
export interface BucketsResponseGen2 {
  buckets: ObjectStorageBucket[];
  errors: BucketErrorGen2[];
}

// TODO: OBJGen2 - Remove the `Gen2` suffix when Gen2 is in GA.
export interface BucketErrorGen2 {
  endpoint: ObjectStorageEndpoint;
  error: APIError[];
}

// TODO: OBJGen2 - Only needed during interim period when Gen2 is in beta.
export type BucketsResponseType<T> = T extends true
  ? BucketsResponseGen2
  : BucketsResponse;

// TODO: OBJGen2 - Only needed during interim period when Gen2 is in beta.
export function isBucketError(
  error: BucketError | BucketErrorGen2
): error is BucketError {
  return (error as BucketError).cluster !== undefined;
}

/**
 * @deprecated This function is deprecated and will be removed in the future.
 */
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

/**
 * @deprecated This function is deprecated and will be removed in the future.
 */
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
 * We had to change the signature of things slightly since we're using the `object-storage/endpoints`
 * endpoint. Note that the server response always includes information for all regions.
 * @note This will be the preferred way to get all buckets once fetching by clusters is deprecated and Gen2 is in GA.
 */
export const getAllBucketsFromEndpoints = async (
  endpoints: ObjectStorageEndpoint[] | undefined
): Promise<BucketsResponseGen2> => {
  if (!endpoints?.length) {
    return { buckets: [], errors: [] };
  }

  // Initialize a Map to group endpoints by region for better error handling and flexibility.
  const endpointsByRegion = new Map<string, ObjectStorageEndpoint[]>();

  for (const endpoint of endpoints) {
    const existingEndpoint = endpointsByRegion.get(endpoint.region) || [];

    // Update the Map with the current endpoint, maintaining all endpoints per region.
    endpointsByRegion.set(endpoint.region, [...existingEndpoint, endpoint]);
  }

  const results = await Promise.all(
    Array.from(endpointsByRegion.entries()).map(([region, regionEndpoints]) =>
      getAll<ObjectStorageBucket>((params) =>
        getBucketsInRegion(region, params)
      )()
        .then((data) => ({
          buckets: data.data,
          endpoints: regionEndpoints,
        }))
        .catch((error) => ({
          endpoints: regionEndpoints,
          error,
        }))
    )
  );

  const buckets: ObjectStorageBucket[] = [];
  const errors: BucketErrorGen2[] = [];

  results.forEach((result) => {
    if ('buckets' in result) {
      buckets.push(...result.buckets);
    } else {
      // For each endpoint in the region, log the error to provide detailed error information.
      result.endpoints.forEach((endpoint) => {
        errors.push({ endpoint, error: result.error });
      });
    }
  });

  if (errors.length === endpoints.length) {
    throw new Error('Unable to get Object Storage buckets.');
  }

  return { buckets, errors };
};

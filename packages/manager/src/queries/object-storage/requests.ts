import {
  getBuckets,
  getBucketsInCluster,
  getBucketsInRegion,
  getClusters,
  getObjectStorageTypes,
} from '@linode/api-v4';

import { getAll } from 'src/utilities/getAll';

import type {
  APIError,
  ObjectStorageBucket,
  ObjectStorageCluster,
  PriceType,
  Region,
} from '@linode/api-v4';

export const getAllObjectStorageClusters = () =>
  getAll<ObjectStorageCluster>(() => getClusters())().then((data) => data.data);

export const getAllObjectStorageBuckets = () =>
  getAll<ObjectStorageBucket>(() => getBuckets())().then((data) => data.data);

export const getAllObjectStorageTypes = () =>
  getAll<PriceType>((params) => getObjectStorageTypes(params))().then(
    (data) => data.data
  );

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

export interface BucketsResponse {
  buckets: ObjectStorageBucket[];
  errors: BucketError[];
}

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

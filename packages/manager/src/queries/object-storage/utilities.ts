import { getBucket } from '@linode/api-v4';

import { objectStorageQueries } from './queries';

import type { ObjectStorageBucket } from '@linode/api-v4';
import type { QueryClient } from '@tanstack/react-query';

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
 * Fetches a single bucket and updates it in the cache.
 *
 * We have this function so we have an efficent way to update a single bucket
 * as opposed to re-fetching all buckets.
 */
export const fetchBucketAndUpdateCache = async (
  regionId: string,
  bucketName: string,
  queryClient: QueryClient
) => {
  const bucket = await getBucket(regionId, bucketName);

  queryClient.setQueryData<ObjectStorageBucket[]>(
    objectStorageQueries.allBucketsInRegion(regionId).queryKey,
    (previousData) => {
      if (!previousData) {
        return undefined;
      }

      const indexOfBucket = previousData.findIndex(
        (b) =>
          (b.region === regionId || b.cluster === regionId) &&
          b.label === bucketName
      );

      if (indexOfBucket === -1) {
        // If the bucket does not exist in the cache don't try to update it.
        return undefined;
      }

      const newBuckets = [...previousData];

      newBuckets[indexOfBucket] = bucket;

      return newBuckets;
    }
  );

  return bucket;
};

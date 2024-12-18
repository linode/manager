import { getBucket } from '@linode/api-v4';

import { objectStorageQueries } from './queries';

import type { BucketsResponse } from './requests';
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
  regionOrCluster: string,
  bucketName: string,
  queryClient: QueryClient
) => {
  const bucket = await getBucket(regionOrCluster, bucketName);

  queryClient.setQueryData<BucketsResponse>(
    objectStorageQueries.buckets.queryKey,
    (previousData) => {
      if (!previousData) {
        return undefined;
      }

      const indexOfBucket = previousData.buckets.findIndex(
        (b) =>
          (b.region === regionOrCluster || b.cluster === regionOrCluster) &&
          b.label === bucketName
      );

      if (indexOfBucket === -1) {
        // If the bucket does not exist in the cache don't try to update it.
        return undefined;
      }

      const newBuckets = [...previousData.buckets];

      newBuckets[indexOfBucket] = bucket;

      return {
        buckets: newBuckets,
        errors: previousData?.errors ?? [],
      };
    }
  );

  return bucket;
};

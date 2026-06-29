import { useMemo } from 'react';

import { useObjectStorageBucketQueriesByRegions } from 'src/features/ObjectStorage/hooks/useObjectStorageBucketQueriesByRegions';

import type { APIError, ObjectStorageBucket } from '@linode/api-v4';

export interface UseObjectStorageBucketsOptions {
  enabled?: boolean;
  regionIds?: null | Set<string>;
  retryOnMount?: boolean;
}

export interface UseObjectStorageBucketsResult {
  bucketFetchFailedForAllRegions: boolean;
  bucketFetchFailedForAnyRegion: boolean;
  data: ObjectStorageBucket[] | undefined;
  error: null | string;
  errorsByRegionId: null | Record<string, APIError[]>;
  failedRegionIds: string[];
  isLoading: boolean;
  isPending: boolean;

  regionListLoadingErrors: APIError[] | null;
}

export const useObjectStorageBuckets = ({
  regionIds = null,
  enabled = true,
  retryOnMount = true,
}: UseObjectStorageBucketsOptions = {}): UseObjectStorageBucketsResult => {
  const {
    bucketQueriesByRegions,
    isLoading,
    regionListLoadingErrors,
    isPending,
  } = useObjectStorageBucketQueriesByRegions({
    regionIds,
    enabled,
    retryOnMount,
  });

  const queries = useMemo(
    () => (bucketQueriesByRegions ? Object.values(bucketQueriesByRegions) : []),
    [bucketQueriesByRegions]
  );

  const bucketDataSignature = queries
    .map((q) => `${q.dataUpdatedAt}`)
    .join('|');
  const buckets = useMemo(() => {
    if (isLoading) {
      // return buckets only once all are loaded.
      return undefined;
    }
    return queries
      .map((query) => query.data)
      .filter((data): data is ObjectStorageBucket[] => Boolean(data))
      .flat();
  }, [isLoading, bucketDataSignature]);

  const bucketErrorsSignature = queries
    .map((q) => `${q.errorUpdatedAt}`)
    .join('|');

  const errorsByRegionId = useMemo(() => {
    if (!bucketQueriesByRegions) {
      return null;
    }
    const errorEntries = Object.entries(bucketQueriesByRegions)
      .filter(([, query]) => Boolean(query.error))
      .map(
        ([regionId, query]) => [regionId, query.error as APIError[]] as const
      );

    if (errorEntries.length === 0) {
      return null;
    }

    return Object.fromEntries(errorEntries);
  }, [bucketErrorsSignature, bucketQueriesByRegions]);

  const failedRegionIds = useMemo(
    () => (errorsByRegionId ? Object.keys(errorsByRegionId) : []),
    [errorsByRegionId]
  );

  const isRegionListLoadingError = Boolean(regionListLoadingErrors?.length);

  const bucketFetchFailedForAnyRegion =
    isRegionListLoadingError || errorsByRegionId !== null;
  const bucketFetchFailedForAllRegions =
    isRegionListLoadingError ||
    (errorsByRegionId !== null &&
      Object.keys(errorsByRegionId).length === queries.length);

  const error = bucketFetchFailedForAllRegions
    ? 'Unable to fetch Object Storage buckets.'
    : null;

  return {
    data: buckets,
    regionListLoadingErrors,
    errorsByRegionId,
    failedRegionIds,
    bucketFetchFailedForAllRegions,
    bucketFetchFailedForAnyRegion,
    isLoading,
    isPending,
    error,
  };
};

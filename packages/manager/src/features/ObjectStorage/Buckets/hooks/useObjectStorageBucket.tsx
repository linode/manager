import { useMemo } from 'react';

import { useBucketsByRegionQueries } from 'src/queries/object-storage/queries';

import type { APIError, ObjectStorageBucket } from '@linode/api-v4';

export interface UseObjectStorageBucketOptions {
  bucketName: string;
  enabled?: boolean;
  regionId: string;
}

export interface UseObjectStorageBucketResult {
  bucket: null | ObjectStorageBucket;
  error: APIError[] | null;
  isError: boolean;
  isLoading: boolean;
}

export const useObjectStorageBucket = ({
  regionId,
  bucketName,
  enabled = true,
}: UseObjectStorageBucketOptions): UseObjectStorageBucketResult => {
  // fetch all buckets in the region since we are going to need them anyway
  const {
    data: buckets,
    isError,
    isLoading,
    error,
  } = useBucketsByRegionQueries([regionId], enabled)[0];

  const bucket = useMemo(() => {
    if (!buckets) {
      return undefined;
    }
    return (
      buckets.find((b) => b.region === regionId && b.label === bucketName) ??
      null
    );
  }, [buckets, regionId, bucketName]);

  const isNotFoundError = bucket === null;

  return {
    bucket: bucket ?? null,
    error: error
      ? error
      : isNotFoundError
        ? [{ reason: `Bucket '${bucketName}' could not be found.` }]
        : null,
    isError: isError || isNotFoundError,
    isLoading,
  };
};

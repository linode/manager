import { useMemo } from 'react';

import { useBucketsByRegionQueries } from 'src/queries/object-storage/queries';

import { useObjectStorageRegionsWithAssignedEndpoints } from '../../shared/hooks/useObjectStorageRegionsWithAssignedEndpoints';

import type { APIError, ObjectStorageBucket } from '@linode/api-v4';
import type { UseQueryResult } from '@tanstack/react-query';

export interface UseObjectStorageBucketsByRegionsOptions {
  enabled?: boolean;
  regionIds?: null | Set<string>;
  retryOnMount?: boolean;
}

export interface UseObjectStorageBucketsByRegionsResult {
  bucketQueriesByRegions:
    | Record<string, UseQueryResult<ObjectStorageBucket[], APIError[]>>
    | undefined;
  isLoading: boolean;
  isPending: boolean;
  regionListLoadingErrors: APIError[] | null;
}

export const useObjectStorageBucketQueriesByRegions = ({
  regionIds = null,
  enabled = true,
  retryOnMount = true,
}: UseObjectStorageBucketsByRegionsOptions = {}): UseObjectStorageBucketsByRegionsResult => {
  const {
    regionsWithAssignedEndpoints,
    isLoading: areRegionsLoading,
    isPending,
    errors: regionLoadingErrors,
  } = useObjectStorageRegionsWithAssignedEndpoints({ enabled });
  const regionIdsToQuery = useMemo(
    () =>
      regionsWithAssignedEndpoints
        ?.map((region) => region.id)
        .filter((regionId) => regionIds === null || regionIds?.has(regionId)) ??
      [],
    [regionsWithAssignedEndpoints, regionIds]
  );
  const bucketQueries = useBucketsByRegionQueries(
    regionIdsToQuery,
    enabled && regionIdsToQuery.length > 0,
    { retryOnMount }
  );

  const bucketQueriesByRegions: Record<
    string,
    UseQueryResult<ObjectStorageBucket[], APIError[]>
  > = Object.fromEntries(
    regionIdsToQuery.map((regionId, idx) => [regionId, bucketQueries[idx]])
  );

  const isLoading =
    areRegionsLoading ||
    Object.values(bucketQueriesByRegions).some(
      (regionBuckets) => regionBuckets.isLoading
    );

  return {
    bucketQueriesByRegions,
    regionListLoadingErrors: regionLoadingErrors,
    isLoading,
    isPending,
  };
};

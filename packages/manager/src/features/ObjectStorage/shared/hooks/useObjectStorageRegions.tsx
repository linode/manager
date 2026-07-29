import { getRegionsByRegionId } from '@akamai/compute-ui-core/api';
import { useRegionsQuery } from '@linode/queries';
import * as React from 'react';

import type { APIError, Region } from '@linode/api-v4';

export interface UseObjectStorageRegionsOptions {
  enabled?: boolean;
}

export interface UseObjectStorageRegionsResult {
  errors: APIError[] | null;
  isError: boolean;
  isLoading: boolean;
  isPending: boolean;
  objectStorageRegions: Region[] | undefined;
  regionsByIdMap: Record<string, Region> | undefined;
}

export function useObjectStorageRegions({
  enabled = true,
}: UseObjectStorageRegionsOptions = {}): UseObjectStorageRegionsResult {
  const {
    data: allRegions,
    error: errors,
    isError,
    isLoading,
    isPending,
  } = useRegionsQuery(enabled);

  const objectStorageRegions = React.useMemo(
    () =>
      allRegions?.filter((region) =>
        region.capabilities.includes('Object Storage')
      ),
    [allRegions]
  );

  const regionsByIdMap =
    objectStorageRegions && getRegionsByRegionId(objectStorageRegions);

  return {
    errors,
    objectStorageRegions,
    regionsByIdMap,
    isLoading,
    isError,
    isPending,
  };
}

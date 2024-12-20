import * as React from 'react';

import { filterRegionsByEndpoints } from 'src/features/ObjectStorage/utilities';
import { useObjectStorageEndpoints } from 'src/queries/object-storage/queries';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { getRegionsByRegionId } from 'src/utilities/regions';

import { useIsObjectStorageGen2Enabled } from './useIsObjectStorageGen2Enabled';

export const useObjectStorageRegions = () => {
  const { data: allRegions, error: allRegionsError } = useRegionsQuery();
  const {
    data: storageEndpoints,
    error: storageEndpointsError,
    isFetching: isStorageEndpointsLoading,
  } = useObjectStorageEndpoints();

  const { isObjectStorageGen2Enabled } = useIsObjectStorageGen2Enabled();

  const availableStorageRegions = React.useMemo(
    () =>
      filterRegionsByEndpoints(
        allRegions,
        storageEndpoints,
        isObjectStorageGen2Enabled
      ),
    [allRegions, storageEndpoints, isObjectStorageGen2Enabled]
  );

  const regionsByIdMap =
    availableStorageRegions && getRegionsByRegionId(availableStorageRegions);

  return {
    allRegions,
    allRegionsError,
    availableStorageRegions,
    isStorageEndpointsLoading,
    regionsByIdMap,
    storageEndpoints,
    storageEndpointsError,
  };
};

import { useRegionsQuery } from '@linode/queries';
import { getRegionsByRegionId } from '@linode/utilities';
import * as React from 'react';

import { filterRegionsByEndpoints } from 'src/features/ObjectStorage/utilities';
import { useObjectStorageEndpoints } from 'src/queries/object-storage/queries';

export const useObjectStorageRegions = () => {
  const { data: allRegions, error: allRegionsError } = useRegionsQuery();
  const {
    data: storageEndpoints,
    error: storageEndpointsError,
    isFetching: isStorageEndpointsLoading,
  } = useObjectStorageEndpoints();

  const availableStorageRegions = React.useMemo(
    () => filterRegionsByEndpoints(allRegions, storageEndpoints),
    [allRegions, storageEndpoints]
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

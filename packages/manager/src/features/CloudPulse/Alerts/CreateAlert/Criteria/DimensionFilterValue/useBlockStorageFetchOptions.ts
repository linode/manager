import { useAllLinodesQuery } from '@linode/queries';
import { useMemo } from 'react';

import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { getOfflineRegionFilteredResources } from '../../../Utils/AlertResourceUtils';
import { filterRegionByServiceType } from '../../../Utils/utils';
import { getBlockStorageLinodes, scopeBasedFilteredResources } from './utils';

import type { FetchOptions, FetchOptionsProps } from './constants';
import type { Filter } from '@linode/api-v4';

export function useBlockStorageFetchOptions(
  props: FetchOptionsProps
): FetchOptions {
  const {
    dimensionLabel,
    regions,
    entities,
    serviceType,
    type,
    scope,
    selectedRegions,
  } = props;

  const {
    data: blockStorageResources,
    isLoading: isBlockStorageLoading,
    isError: isBlockStorageError,
  } = useResourcesQuery(dimensionLabel === 'linode_id', 'blockstorage');

  // Offline filter buckets by supported regions
  const supportedRegionIds =
    (regions &&
      filterRegionByServiceType(type, regions, 'blockstorage').map(
        ({ id }) => id
      )) ||
    [];

  // Create a filter for regions based on supported region IDs
  const regionFilter: Filter = {
    '+or':
      supportedRegionIds && supportedRegionIds.length > 0
        ? supportedRegionIds.map((regionId) => ({
            region: regionId,
          }))
        : undefined,
  };

  const regionFilteredBuckets = getOfflineRegionFilteredResources(
    blockStorageResources ?? [],
    supportedRegionIds
  );

  const filteredResources = scopeBasedFilteredResources({
    scope: scope ?? null,
    resources: regionFilteredBuckets,
    entities,
    selectedRegions,
  });

  const filteredBlockStorageParentEntityIds = filteredResources?.map(
    ({ volumeLinodeId }) => volumeLinodeId
  );

  const idFilter: Filter = {
    '+or': filteredBlockStorageParentEntityIds.length
      ? filteredBlockStorageParentEntityIds.map((id) => ({ id }))
      : undefined,
  };

  const combinedFilter: Filter = {
    '+and': [regionFilter, idFilter].filter(Boolean),
  };

  const {
    data: linodes,
    isError: isLinodesError,
    isLoading: isLinodesLoading,
  } = useAllLinodesQuery(
    {},
    combinedFilter,
    serviceType === 'blockstorage' &&
      dimensionLabel === 'linode_id' &&
      filteredBlockStorageParentEntityIds.length > 0 &&
      supportedRegionIds.length > 0
  );

  const blockStorageLinodes = useMemo(
    () => getBlockStorageLinodes(linodes ?? []),
    [linodes]
  );

  return {
    values: blockStorageLinodes,
    isLoading: isLinodesLoading || isBlockStorageLoading,
    isError: isBlockStorageError || isLinodesError,
  };
}

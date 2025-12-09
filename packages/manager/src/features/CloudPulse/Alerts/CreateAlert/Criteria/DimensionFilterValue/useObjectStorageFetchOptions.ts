import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import {
  getEndpointOptions,
  getOfflineRegionFilteredResources,
} from '../../../Utils/AlertResourceUtils';
import { filterRegionByServiceType } from '../../../Utils/utils';
import { scopeBasedFilteredResources } from './utils';

import type { FetchOptions, FetchOptionsProps } from './constants';
/**
 * Fetch selectable options for Object Storage dimensions (currently endpoints only).
 */
export function useObjectStorageFetchOptions(
  props: FetchOptionsProps
): FetchOptions {
  const { dimensionLabel, regions, entities, type, scope, selectedRegions } =
    props;

  const {
    data: buckets,
    isLoading,
    isError,
  } = useResourcesQuery(dimensionLabel === 'endpoint', 'objectstorage');

  if (dimensionLabel !== 'endpoint') {
    return { values: [], isLoading: false, isError: false };
  }

  // Offline filter buckets by supported regions
  const supportedRegionIds =
    (regions &&
      filterRegionByServiceType(type, regions, 'objectstorage').map(
        ({ id }) => id
      )) ||
    [];
  const regionFilteredBuckets = getOfflineRegionFilteredResources(
    buckets ?? [],
    supportedRegionIds
  );

  // Filtering the buckets based on the scope
  const filteredBuckets = scopeBasedFilteredResources({
    scope: scope ?? null,
    resources: regionFilteredBuckets,
    entities,
    selectedRegions,
  });

  // Build endpoint list from the filtered buckets
  const endpoints: string[] = getEndpointOptions(filteredBuckets, true, []);

  // Convert to <Item<string,string>>[]
  const values = endpoints.map((endpoint) => ({
    label: endpoint,
    value: endpoint,
  }));

  return {
    values,
    isLoading,
    isError,
  };
}

import { useAllLinodesQuery } from '@linode/queries';
import { useMemo } from 'react';

import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { filterRegionByServiceType } from '../../../Utils/utils';
import {
  getFilteredFirewallResources,
  getFirewallLinodes,
  getLinodeRegions,
} from './utils';

import type { Item } from '../../../constants';
import type { CloudPulseServiceType, Filter, Region } from '@linode/api-v4';

interface FetchOptionsProps {
  /**
   * The dimension label determines the filtering logic and return type.
   */
  dimensionLabel: null | string;
  /**
   * List of firewall entity IDs to filter on.
   */
  entities?: string[];
  /**
   * List of regions to filter on.
   */
  regions?: Region[];
  /**
   * Service to apply specific transformations to dimension values.
   */
  serviceType?: CloudPulseServiceType | null;
  /**
   * The type of monitoring to filter on.
   */
  type: 'alerts' | 'metrics';
}
/**
 * Custom hook to return selectable options based on the dimension type.
 * Handles fetching and transforming data for edge-cases.
 */
export function useFetchOptions(
  props: FetchOptionsProps
): Item<string, string>[] {
  const { dimensionLabel, regions, entities, serviceType, type } = props;

  const supportedRegionIds =
    (serviceType &&
      regions &&
      filterRegionByServiceType(type, regions, serviceType).map(
        ({ id }) => id
      )) ||
    [];

  // Create a filter for regions based on suppoerted region IDs
  const regionFilter: Filter =
    supportedRegionIds && supportedRegionIds.length > 0
      ? {
          '+or': supportedRegionIds.map((regionId) => ({
            region: regionId,
          })),
        }
      : {};

  const filterLabels: string[] = [
    'parent_vm_entity_id',
    'region_id',
    'associated_entity_region',
  ];

  // Fetch all firewall resources when dimension requires it
  const { data: firewallResources } = useResourcesQuery(
    filterLabels.includes(dimensionLabel ?? ''),
    'firewall'
  );

  // Filter firewall resources by the given entities list
  const filteredFirewallResourcesIds = useMemo(
    () => getFilteredFirewallResources(firewallResources, entities),
    [firewallResources, entities]
  );

  const idFilter = filteredFirewallResourcesIds.length
    ? { '+or': filteredFirewallResourcesIds.map((id) => ({ id })) }
    : [];

  const combinedFilter: Filter = {
    '+and': [idFilter, regionFilter].filter(Boolean) as Filter[],
  };
  // Fetch all linodes with the combined filter
  const { data: linodes } = useAllLinodesQuery(
    {},
    combinedFilter,
    filterLabels.includes(dimensionLabel ?? '') &&
      filteredFirewallResourcesIds.length > 0 &&
      supportedRegionIds.length > 0
  );

  // Extract linodes from filtered firewall resources
  const firewallLinodes = useMemo(
    () => getFirewallLinodes(linodes ?? []),
    [linodes]
  );

  // Extract unique regions from linodes
  const linodeRegions = useMemo(
    () => getLinodeRegions(linodes ?? []),
    [linodes]
  );

  // Determine what options to return based on the dimension label
  switch (dimensionLabel) {
    case 'associated_entity_region':
      return linodeRegions;
    case 'parent_vm_entity_id':
      return firewallLinodes;
    case 'region_id':
      return linodeRegions;
    default:
      return [];
  }
}

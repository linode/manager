import { useAllLinodesQuery, useRegionsQuery } from '@linode/queries';
import { useMemo } from 'react';

import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { getSupportedRegionIds } from '../../../Utils/AlertResourceUtils';
import {
  getFilteredFirewallResources,
  getFirewallLinodes,
  getLinodeRegions,
  getStaticOptions,
} from './utils';

import type { Item } from '../../../constants';
import type { CloudPulseServiceType, Filter } from '@linode/api-v4';

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
   * Service to apply specific transformations to dimension values.
   */
  serviceType?: CloudPulseServiceType | null;
  /**
   * Static list of value strings to be converted to autocomplete options.
   */
  values?: null | string[];
}

/**
 * Custom hook to return selectable options based on the dimension type.
 * Handles fetching and transforming data for edge-cases.
 */
export function useFetchOptions(
  props: FetchOptionsProps
): Item<string, string>[] {
  const { dimensionLabel, values, entities, serviceType } = props;

  // Create static options if a predefined list of strings is provided
  const staticOptions = useMemo(
    () =>
      getStaticOptions(
        serviceType ?? undefined,
        dimensionLabel ?? '',
        values ?? []
      ),
    [dimensionLabel, serviceType, values]
  );

  const { data: regions } = useRegionsQuery();
  const supportedRegionIds =
    serviceType && getSupportedRegionIds(regions, 'linode');
  const regionFilter: Filter =
    supportedRegionIds && supportedRegionIds.length > 0
      ? {
          '+or': supportedRegionIds.map((regionId) => ({
            region: regionId,
          })),
        }
      : {};

  // Fetch all firewall resources when dimension requires it
  const { data: firewallResources } = useResourcesQuery(
    dimensionLabel === 'parent_vm_entity_id' || dimensionLabel === 'region_id',
    'firewall'
  );

  // Filter firewall resources by the given entities list
  const filteredFirewallResources = useMemo(
    () => getFilteredFirewallResources(firewallResources, entities),
    [firewallResources, entities]
  );

  // Extract linodes from filtered firewall resources
  const firewallLinodes = useMemo(
    () => getFirewallLinodes(filteredFirewallResources),
    [filteredFirewallResources]
  );

  // Collect linode IDs from firewall linodes to query additional data
  const selectedFirewallLinodeIds = useMemo(
    () => firewallLinodes.map((l) => Number(l.value)),
    [firewallLinodes]
  );

  const combinedFilter = {
    '+and': [
      { '+or': selectedFirewallLinodeIds.map((id) => ({ id })) },
      ...(regionFilter['+or'] ? [regionFilter] : []),
    ],
  };
  // Fetch all linodes if the dimension is region_id and there are selected firewall linodes
  const { data: linodes } = useAllLinodesQuery(
    {},
    combinedFilter,
    selectedFirewallLinodeIds.length > 0 && dimensionLabel === 'region_id'
  );

  // Extract unique regions from linodes
  const linodeRegions = useMemo(() => getLinodeRegions(linodes), [linodes]);

  // Determine what options to return based on the dimension label
  switch (dimensionLabel) {
    case 'parent_vm_entity_id':
      return firewallLinodes;
    case 'region_id':
      return linodeRegions;
    default:
      return staticOptions;
  }
}

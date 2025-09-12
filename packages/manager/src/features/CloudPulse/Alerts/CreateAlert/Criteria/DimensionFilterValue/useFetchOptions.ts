import { useAllLinodesQuery, useAllVPCsQuery } from '@linode/queries';
import { useMemo } from 'react';

import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { filterRegionByServiceType } from '../../../Utils/utils';
import {
  getFilteredFirewallResources,
  getFirewallLinodes,
  getLinodeRegions,
  getVPCSubnets,
} from './utils';

import type { FetchOptions } from './constants';
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
export function useFetchOptions(props: FetchOptionsProps): FetchOptions {
  const { dimensionLabel, regions, entities, serviceType, type } = props;

  const supportedRegionIds =
    (serviceType &&
      regions &&
      filterRegionByServiceType(type, regions, serviceType).map(
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
        : [{ region: '' }],
  };

  const filterLabels: string[] = [
    'linode_id',
    'region_id',
    'associated_entity_region',
  ];
  // Fetch all firewall resources when dimension requires it
  const {
    data: firewallResources,
    isLoading: isResourcesLoading,
    isError: isResourcesError,
  } = useResourcesQuery(
    filterLabels.includes(dimensionLabel ?? ''),
    'firewall'
  );

  // Decide firewall resource IDs based on scope
  const filteredFirewallResourcesIds = useMemo(() => {
    return getFilteredFirewallResources(firewallResources, entities);
  }, [firewallResources, entities]);

  const idFilter = {
    '+or': filteredFirewallResourcesIds.length
      ? filteredFirewallResourcesIds.map((id) => ({ id }))
      : [{ id: '' }],
  };

  const combinedFilter: Filter = {
    '+and': [idFilter, regionFilter].filter(Boolean) as Filter[],
  };

  // Fetch all linodes with the combined filter
  const {
    data: linodes,
    isError: isLinodesError,
    isLoading: isLinodesLoading,
  } = useAllLinodesQuery(
    {},
    combinedFilter,
    filterLabels.includes(dimensionLabel ?? '') &&
      filteredFirewallResourcesIds.length > 0 &&
      supportedRegionIds?.length > 0
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

  const {
    data: vpcs,
    isLoading: isVPCsLoading,
    isError: isVPCsError,
  } = useAllVPCsQuery({
    enabled: dimensionLabel === 'vpc_subnet_id',
  });

  const vpcSubnets = useMemo(() => getVPCSubnets(vpcs ?? []), [vpcs]);
  // Determine what options to return based on the dimension label
  switch (dimensionLabel) {
    case 'associated_entity_region':
    case 'region_id':
      return {
        values: linodeRegions,
        isError: isLinodesError || isResourcesError,
        isLoading: isLinodesLoading || isResourcesLoading,
      };
    case 'linode_id':
      return {
        values: firewallLinodes,
        isError: isLinodesError || isResourcesError,
        isLoading: isLinodesLoading || isResourcesLoading,
      };
    case 'vpc_subnet_id':
      return {
        values: vpcSubnets,
        isError: isVPCsError,
        isLoading: isVPCsLoading,
      };
    default:
      return { values: [], isLoading: false, isError: false };
  }
}

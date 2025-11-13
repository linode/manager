import {
  useAllLinodesQuery,
  useAllNodeBalancersQuery,
  useAllVPCsQuery,
} from '@linode/queries';
import { useMemo } from 'react';

import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { filterRegionByServiceType } from '../../../Utils/utils';
import {
  getFilteredFirewallParentEntities,
  getFirewallLinodes,
  getLinodeRegions,
  getNodebalancerRegions,
  getVPCSubnets,
} from './utils';

import type { FetchOptions, FetchOptionsProps } from './constants';
import type { Filter } from '@linode/api-v4';

/**
 * Custom hook to return selectable options based on the dimension type.
 * Handles fetching and transforming data for edge-cases.
 */
export function useFirewallFetchOptions(
  props: FetchOptionsProps
): FetchOptions {
  const {
    dimensionLabel,
    regions,
    entities,
    serviceType,
    type,
    scope,
    associatedEntityType,
  } = props;

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
    'firewall',
    {},
    {},
    associatedEntityType // To avoid fetching resources for which the associated entity type is not supported
  );
  // Decide firewall resource IDs based on scope
  const filteredFirewallParentEntityIds = useMemo(() => {
    const selectedEntities =
      scope && scope === 'account'
        ? firewallResources?.map((r) => r.id)
        : entities;
    return getFilteredFirewallParentEntities(
      firewallResources,
      selectedEntities
    );
  }, [scope, firewallResources, entities]);

  const idFilter: Filter = {
    '+or': filteredFirewallParentEntityIds.length
      ? filteredFirewallParentEntityIds.map(({ id }) => ({ id }))
      : undefined,
  };

  const labelFilter: Filter = {
    '+or': filteredFirewallParentEntityIds.length
      ? filteredFirewallParentEntityIds.map(({ label }) => ({ label }))
      : undefined,
  };

  const combinedFilterLinode: Filter = {
    '+and': [idFilter, regionFilter].filter(Boolean),
  };

  const combinedFilterNodebalancer: Filter = {
    '+and': [labelFilter, regionFilter].filter(Boolean),
  };

  // Fetch all linodes with the combined filter
  const {
    data: linodes,
    isError: isLinodesError,
    isLoading: isLinodesLoading,
  } = useAllLinodesQuery(
    {},
    combinedFilterLinode,
    serviceType === 'firewall' &&
      filterLabels.includes(dimensionLabel ?? '') &&
      filteredFirewallParentEntityIds.length > 0 &&
      associatedEntityType === 'linode' &&
      supportedRegionIds?.length > 0
  );

  // Fetch all nodebalancers with the combined filter
  const {
    data: nodebalancers,
    isError: isNodebalancersError,
    isLoading: isNodebalancersLoading,
  } = useAllNodeBalancersQuery(
    serviceType === 'firewall' &&
      filterLabels.includes(dimensionLabel ?? '') &&
      filteredFirewallParentEntityIds.length > 0 &&
      associatedEntityType === 'nodebalancer' &&
      supportedRegionIds?.length > 0,
    {},
    combinedFilterNodebalancer
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

  // Extract unique regions from nodebalancers
  const nodebalancerRegions = useMemo(
    () => getNodebalancerRegions(nodebalancers ?? []),
    [nodebalancers]
  );

  const allRegions = useMemo(
    () => Array.from(new Set([...linodeRegions, ...nodebalancerRegions])),
    [linodeRegions, nodebalancerRegions]
  );

  const {
    data: vpcs,
    isLoading: isVPCsLoading,
    isError: isVPCsError,
  } = useAllVPCsQuery({
    enabled: serviceType === 'firewall' && dimensionLabel === 'vpc_subnet_id',
  });

  const vpcSubnets = useMemo(() => getVPCSubnets(vpcs ?? []), [vpcs]);

  // Determine what options to return based on the dimension label
  switch (dimensionLabel) {
    case 'associated_entity_region':
      return {
        values:
          associatedEntityType === 'linode'
            ? linodeRegions
            : associatedEntityType === 'nodebalancer'
              ? nodebalancerRegions
              : allRegions,
        isError: isLinodesError || isResourcesError || isNodebalancersError,
        isLoading:
          isLinodesLoading || isResourcesLoading || isNodebalancersLoading,
      };
    case 'linode_id':
      return {
        values: firewallLinodes,
        isError: isLinodesError || isResourcesError,
        isLoading: isLinodesLoading || isResourcesLoading,
      };
    case 'region_id':
      return {
        values: linodeRegions,
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

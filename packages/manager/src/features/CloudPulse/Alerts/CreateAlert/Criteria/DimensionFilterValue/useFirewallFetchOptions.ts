import {
  useAllLinodesQuery,
  useAllNodeBalancersQuery,
  useAllVPCsQuery,
} from '@linode/queries';
import { useMemo } from 'react';

import { filterFirewallResources } from 'src/features/CloudPulse/Utils/utils';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { filterRegionByServiceType } from '../../../Utils/utils';
import {
  getFilteredFirewallParentEntities,
  getFirewallLinodes,
  getFirewallNodebalancers,
  getLinodeRegions,
  getNodebalancerRegions,
  getVPCSubnets,
} from './utils';

import type { FetchOptions, FetchOptionsProps } from './constants';
import type { Filter, Firewall, Params } from '@linode/api-v4';

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
        : undefined,
  };

  const filterLabels: string[] = [
    'linode_id',
    'region_id',
    'associated_entity_region',
    'nodebalancer_id',
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
    associatedEntityType,
    associatedEntityType
      ? (resources: Firewall[]) =>
          filterFirewallResources(resources, associatedEntityType)
      : undefined
    // To avoid fetching resources for which the associated entity type is not supported
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

  const enableLinodeNodebalancerRegions =
    serviceType === 'firewall' &&
    filterLabels.includes(dimensionLabel ?? '') &&
    filteredFirewallParentEntityIds.length > 0 &&
    supportedRegionIds?.length > 0;

  // Fetch all linodes with the combined filter
  const {
    values: linodeRegions,
    isError: isLinodesError,
    isLoading: isLinodesLoading,
  } = useFetchLinodeRegions(
    enableLinodeNodebalancerRegions && associatedEntityType === 'linode',
    {
      '+and': [idFilter, regionFilter].filter(Boolean),
    },
    {},
    dimensionLabel === 'associated_entity_region'
  );

  // Fetch all nodebalancers with the combined filter
  const {
    values: nodebalancerRegions,
    isError: isNodebalancersError,
    isLoading: isNodebalancersLoading,
  } = useFetchNodebalancerRegions(
    enableLinodeNodebalancerRegions && associatedEntityType === 'nodebalancer',
    {
      '+and': [labelFilter, regionFilter].filter(Boolean),
    },
    {},
    dimensionLabel === 'associated_entity_region'
  );

  // Fetch VPC Subnet options
  const {
    values: vpcs,
    isLoading: isVPCsLoading,
    isError: isVPCsError,
  } = useFetchVpcSubnets(
    serviceType === 'firewall' && dimensionLabel === 'vpc_subnet_id'
  );

  // Determine what options to return based on the dimension label
  switch (dimensionLabel) {
    case 'associated_entity_region':
      return {
        values:
          associatedEntityType === 'linode'
            ? linodeRegions
            : associatedEntityType === 'nodebalancer'
              ? nodebalancerRegions
              : [],
        isError: isLinodesError || isResourcesError || isNodebalancersError,
        isLoading:
          isLinodesLoading || isResourcesLoading || isNodebalancersLoading,
      };
    case 'linode_id':
    case 'region_id':
      return {
        values: linodeRegions,
        isError: isLinodesError || isResourcesError,
        isLoading: isLinodesLoading || isResourcesLoading,
      };
    case 'nodebalancer_id':
      return {
        values: nodebalancerRegions,
        isError: isNodebalancersError || isResourcesError,
        isLoading: isNodebalancersLoading || isResourcesLoading,
      };

    case 'vpc_subnet_id':
      return {
        values: vpcs,
        isError: isVPCsError,
        isLoading: isVPCsLoading,
      };
    default:
      return { values: [], isLoading: false, isError: false };
  }
}

const useFetchLinodeRegions = (
  enabled: boolean = true,
  filter: Filter = {},
  params: Params = {},
  isAssociateEntityRegion: boolean = false
) => {
  const { data, isLoading, isError } = useAllLinodesQuery(
    params,
    filter,
    enabled
  );

  // Extract linodes from filtered firewall resources
  const firewallLinodes = useMemo(() => getFirewallLinodes(data ?? []), [data]);

  // Extract unique regions from linodes
  const linodeRegions = useMemo(() => getLinodeRegions(data ?? []), [data]);

  return {
    values: isAssociateEntityRegion ? linodeRegions : firewallLinodes,
    isError,
    isLoading,
  };
};

const useFetchNodebalancerRegions = (
  enabled: boolean = true,
  filter: Filter = {},
  params: Params = {},
  isAssociateEntityRegion: boolean = false
): FetchOptions => {
  const { data, isError, isLoading } = useAllNodeBalancersQuery(
    enabled,
    params,
    filter
  );

  // Extract nodebalancers from filtered firewall resources
  const firewallNodebalancers = useMemo(
    () => getFirewallNodebalancers(data ?? []),
    [data]
  );

  // Extract unique regions from nodebalancers
  const nodebalancerRegions = useMemo(
    () => getNodebalancerRegions(data ?? []),
    [data]
  );

  return {
    values: isAssociateEntityRegion
      ? nodebalancerRegions
      : firewallNodebalancers,
    isError,
    isLoading,
  };
};

const useFetchVpcSubnets = (enabled: boolean = true): FetchOptions => {
  const { data, isLoading, isError } = useAllVPCsQuery({ enabled });

  const vpcSubnets = useMemo(() => getVPCSubnets(data ?? []), [data]);

  return {
    isLoading,
    isError,
    values: vpcSubnets,
  };
};

import { transformDimensionValue } from '../../../Utils/utils';

import type { Item } from '../../../constants';
import type { OperatorGroup } from './constants';
import type {
  AlertDefinitionScope,
  CloudPulseServiceType,
  DimensionFilterOperatorType,
  Linode,
  NodeBalancer,
  VPC,
} from '@linode/api-v4';
import type { CloudPulseResources } from 'src/features/CloudPulse/shared/CloudPulseResourcesSelect';
import type { FirewallEntity } from 'src/features/CloudPulse/shared/types';

/**
 * Resolves the selected value(s) for the Autocomplete component from raw string.
 * @param options - List of selectable options.
 * @param value - The selected value(s) in raw string format.
 * @param isMultiple - Whether multiple values are allowed.
 * @returns - Matched option(s) for the Autocomplete input.
 */
export const resolveSelectedValues = (
  options: Item<string, string>[],
  value: null | string,
  isMultiple: boolean
): Item<string, string> | Item<string, string>[] | null => {
  if (!value) return isMultiple ? [] : null;

  if (isMultiple) {
    return options.filter((option) => value.split(',').includes(option.value));
  }

  return options.find((option) => option.value === value) ?? null;
};

/**
 * Converts selected option(s) from Autocomplete into a raw value string.
 * @param selected - Currently selected value(s) from Autocomplete.
 * @param operation - The triggered Autocomplete action (e.g., 'selectOption').
 * @param isMultiple - Whether multiple selections are enabled.
 * @returns - Comma-separated string or single value.
 */
export const handleValueChange = (
  selected: Item<string, string> | Item<string, string>[] | null,
  operation: string,
  isMultiple: boolean
): string => {
  if (!['removeOption', 'selectOption'].includes(operation)) return '';

  if (isMultiple && Array.isArray(selected)) {
    return selected.map((item) => item.value).join(',');
  }

  if (!isMultiple && selected && !Array.isArray(selected)) {
    return selected.value;
  }

  return '';
};

/**
 * Resolves the operator into a corresponding group key.
 * @param operator - The dimension filter operator.
 * @returns - Mapped operator group used for config lookup.
 */
export const getOperatorGroup = (
  operator: DimensionFilterOperatorType | null
): OperatorGroup => {
  if (operator === 'eq' || operator === 'neq') return 'eq_neq';
  if (operator === 'startswith' || operator === 'endswith')
    return 'startswith_endswith';
  if (operator === 'in') return 'in';
  return '*'; // fallback for null/undefined/other
};

/**
 * Converts a list of raw values to static options for Autocomplete.
 * @param values - List of raw string values.
 * @returns - List of label/value option objects.
 */
export const getStaticOptions = (
  serviceType: CloudPulseServiceType | null,
  dimensionLabel: string,
  values: string[]
): Item<string, string>[] => {
  return (
    values?.map((val: string) => ({
      label: transformDimensionValue(serviceType ?? null, dimensionLabel, val),
      value: val,
    })) ?? []
  );
};

/**
 * Filters firewall resources and returns matching parent entity IDs.
 * @param firewallResources - List of firewall resource objects.
 * @param entities - List of target firewall entity IDs.
 * @returns - Flattened array of matching entity IDs.
 */
export const getFilteredFirewallParentEntities = (
  firewallResources: CloudPulseResources[] | undefined,
  entities: string[] | undefined
): FirewallEntity[] => {
  if (!(firewallResources?.length && entities?.length)) return [];

  return firewallResources
    .filter((firewall) => entities.includes(firewall.id))
    .flatMap((firewall) =>
      // combine key as id and value as label for each entity
      firewall.entities
        ? Object.entries(firewall.entities).map(([id, label]) => ({
            id,
            label,
          }))
        : []
    );
};

/**
 * Extracts linode items from firewall resources by merging entities.
 * @param resources - List of firewall resources with entity mappings.
 * @returns - Flattened list of linode ID/label pairs as options.
 */
export const getFirewallLinodes = (
  linodes: Linode[]
): Item<string, string>[] => {
  if (!linodes) return [];
  return linodes.map((linode) => ({
    label: transformDimensionValue('firewall', 'linode_id', linode.label),
    value: String(linode.id),
  }));
};

/**
 * Extracts linode items from firewall resources by merging entities.
 * @param resources - List of firewall resources with entity mappings.
 * @returns - Flattened list of linode ID/label pairs as options.
 */
export const getFirewallNodeBalancers = (
  nodebalancers: NodeBalancer[]
): Item<string, string>[] => {
  if (!nodebalancers) return [];
  return nodebalancers.map((nodebalancer) => ({
    label: transformDimensionValue(
      'firewall',
      'nodebalancer_id',
      nodebalancer.label
    ),
    value: String(nodebalancer.id),
  }));
};

/**
 * Extracts unique region values from a list of linodes.
 * @param linodes - Linode objects with region information.
 * @returns - Deduplicated list of regions as options.
 */
export const getLinodeRegions = (linodes: Linode[]): Item<string, string>[] => {
  if (!linodes) return [];
  const regions = new Set<string>();
  linodes.forEach(({ region }) => region && regions.add(region));
  return Array.from(regions).map((region) => ({
    label: transformDimensionValue('firewall', 'region_id', region),
    value: region,
  }));
};

/**
 * Extracts unique region values from a list of nodebalancers.
 * @param nodebalancers - Nodebalancer objects with region information.
 * @returns - Deduplicated list of regions as options.
 */
export const getNodebalancerRegions = (
  nodebalancers: NodeBalancer[]
): Item<string, string>[] => {
  if (!nodebalancers) return [];
  const regions = new Set<string>();
  nodebalancers.forEach(({ region }) => region && regions.add(region));
  return Array.from(regions).map((region) => ({
    label: transformDimensionValue('firewall', 'region_id', region),
    value: region,
  }));
};

/**
 *
 * @param vpcs List of VPCs
 * @returns a flat list of VPC subnets with transformed labels
 */
export const getVPCSubnets = (vpcs: VPC[]): Item<string, string>[] => {
  if (!vpcs) return [];

  return vpcs.flatMap(({ label: vpcLabel, subnets }) =>
    subnets.map(({ id: subnetId, label: subnetLabel }) => ({
      label: `${vpcLabel}_${subnetLabel}`,
      value: String(subnetId),
    }))
  );
};

interface ScopeBasedFilteredResourcesProps {
  /**
   * A list of entity IDs to filter by when scope is `entity`.
   */
  entities?: string[];
  /**
   * The full list of available CloudPulse resources.
   */
  resources: CloudPulseResources[];
  /**
   * The scope of the alert definition (`account`, `entity`, `region`, or `null`).
   */
  scope: AlertDefinitionScope | null;
  /**
   * A list of region IDs to filter by when scope is `region`.
   */
  selectedRegions?: null | string[];
}

/**
 * Filters a list of Resource objects based on the given alert definition scope.
 *
 * @param props - Object containing filter parameters.
 * @returns A filtered list of resources based on the provided scope.
 */
export const scopeBasedFilteredResources = (
  props: ScopeBasedFilteredResourcesProps
): CloudPulseResources[] => {
  const { scope, resources, selectedRegions, entities } = props;

  switch (scope) {
    case 'account':
      return resources;
    case 'entity':
      return entities
        ? resources.filter((resource) => entities.includes(resource.id))
        : [];
    case 'region':
      return selectedRegions
        ? resources.filter((resource) =>
            selectedRegions.includes(resource.region ?? '')
          )
        : [];
    default:
      return resources;
  }
};

/**
 * Extracts linode items from firewall resources by merging entities.
 * @param resources - List of firewall resources with entity mappings.
 * @returns - Flattened list of linode ID/label pairs as options.
 */
export const getBlockStorageLinodes = (
  linodes: Linode[]
): Item<string, string>[] => {
  if (!linodes) return [];
  return linodes.map((linode) => ({
    label: transformDimensionValue('blockstorage', 'linode_id', linode.label),
    value: String(linode.id),
  }));
};

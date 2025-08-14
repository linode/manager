import { transformDimensionValue } from '../../../Utils/utils';

import type { Item } from '../../../constants';
import type { Linode } from '@linode/api-v4';
import type { CloudPulseResources } from 'src/features/CloudPulse/shared/CloudPulseResourcesSelect';

/**
 * Filters firewall resources and returns matching entity IDs.
 * @param firewallResources - List of firewall resource objects.
 * @param entities - List of target firewall entity IDs.
 * @returns - Flattened array of matching entity IDs.
 */
export const getFilteredFirewallResources = (
  firewallResources: CloudPulseResources[] | undefined,
  entities: string[] | undefined
): string[] => {
  if (!(firewallResources?.length && entities?.length)) return [];

  return firewallResources
    .filter((firewall) => entities.includes(firewall.id))
    .flatMap((firewall) =>
      firewall.entities ? Object.keys(firewall.entities) : []
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
    label: transformDimensionValue(
      'firewall',
      'parent_vm_entity_id',
      linode.label
    ),
    value: String(linode.id),
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

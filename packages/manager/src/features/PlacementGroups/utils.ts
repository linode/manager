import { PlacementGroup } from '@linode/api-v4';
import { AFFINITY_TYPES } from '@linode/api-v4/lib/placement-groups';

import type { CreatePlacementGroupPayload } from '@linode/api-v4';

/**
 * Helper to get the number of Linodes in a Placement Group.
 */
export const getPlacementGroupLinodeCount = (
  placementGroup: PlacementGroup
): number => {
  return placementGroup.linode_ids.length;
};

/**
 * Helper to populate the affinity_type select options.
 */
export const affinityTypeOptions = Object.entries(AFFINITY_TYPES).map(
  ([key, value]) => ({
    label: value,
    value: key as CreatePlacementGroupPayload['affinity_type'],
  })
);

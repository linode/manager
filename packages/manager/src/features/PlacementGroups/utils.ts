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
 * Helper to determine if a Placement Group has reached capacity.
 */
export const hasPlacementGroupReachedCapacity = (
  placementGroup: PlacementGroup
): boolean => {
  return (
    getPlacementGroupLinodeCount(placementGroup) >= placementGroup.capacity
  );
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

/**
 * Helper to get all linodes assigned to any placement group. (and reduce to unique linodes)
 * This is useful for determining which linodes are available to be assigned.
 */
export const getLinodesFromAllPlacementGroups = (
  allPlacementGroups: PlacementGroup[] | undefined
) => {
  if (!allPlacementGroups) {
    return [];
  }

  const linodeIds = allPlacementGroups.reduce((acc, placementGroup) => {
    return [...acc, ...placementGroup.linode_ids];
  }, []);

  return Array.from(new Set(linodeIds));
};

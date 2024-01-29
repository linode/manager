import { PlacementGroup } from '@linode/api-v4';

import { MAX_NUMBER_OF_LINODES_IN_PLACEMENT_GROUP } from 'src/features/PlacementGroups/constants';

/**
 * Helper to get the human readable label for a Placement Group affinity type.
 */
export const getAffinityLabel = (
  affinityType: PlacementGroup['affinity_type']
): string => {
  return affinityType === 'affinity' ? 'Affinity' : 'Anti-affinity';
};

/**
 * Helper to get the number of Linodes in a Placement Group.
 */
export const getPlacementGroupLinodeCount = (
  placementGroup: PlacementGroup
): number => {
  return placementGroup.linode_ids.length;
};

/**
 * Helper to get the number of Placement Groups in a region.
 */
export const getPlacementGroupsCount = (
  placementGroupOptions: PlacementGroup[]
): number => {
  return placementGroupOptions?.length;
};

/**
 * Helper to check if the Placement Group has capacity for more Linodes.
 */
export const placementGroupHasCapacity = (
  placementGroup: PlacementGroup
): boolean => {
  return (
    getPlacementGroupLinodeCount(placementGroup) <
    MAX_NUMBER_OF_LINODES_IN_PLACEMENT_GROUP
  );
};

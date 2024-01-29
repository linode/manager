import { PlacementGroup } from '@linode/api-v4';

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

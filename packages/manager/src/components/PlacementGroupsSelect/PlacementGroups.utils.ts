import { PlacementGroup } from '@linode/api-v4';

export const getAffinityLabel = (
  affinityType: PlacementGroup['affinity_type']
): string => {
  return affinityType === 'affinity' ? 'Affinity' : 'Anti-affinity';
};

export const getPlacementGroupLinodeCount = (
  placementGroup: PlacementGroup
): number => {
  return placementGroup.linode_ids.length;
};

export const getPlacementGroupsCount = (
  placementGroupOptions: PlacementGroup[] | undefined
): boolean => {
  return !!placementGroupOptions?.length;
};

import { AFFINITY_TYPES } from '@linode/api-v4/lib/placement-groups';

import type {
  AffinityEnforcement,
  CreatePlacementGroupPayload,
  PlacementGroup,
  Region,
} from '@linode/api-v4';

/**
 * Helper to get the affinity enforcement readable string.
 */
export const getAffinityEnforcement = (
  affinityType: PlacementGroup['is_strict']
): AffinityEnforcement => {
  return affinityType ? 'Strict' : 'Flexible';
};

/**
 * Helper to get the number of Linodes in a Placement Group.
 */
export const getPlacementGroupLinodeCount = (
  placementGroup: PlacementGroup
): number => {
  return placementGroup.linodes.length;
};

interface HasPlacementGroupReachedCapacityOptions {
  placementGroup: PlacementGroup | undefined;
  region: Region | undefined;
}

/**
 * Helper to determine if a Placement Group has reached capacity.
 */
export const hasPlacementGroupReachedCapacity = ({
  placementGroup,
  region,
}: HasPlacementGroupReachedCapacityOptions): boolean => {
  if (!placementGroup || !region) {
    return false;
  }

  return (
    getPlacementGroupLinodeCount(placementGroup) >= region.maximum_vms_per_pg
  );
};

/**
 * Helper to determine if a region has reached its placement group capacity for the user.
 */
export const hasRegionReachedPlacementGroupCapacity = (
  region: Region | undefined
): boolean => {
  if (!region) {
    return false;
  }

  return region.maximum_pgs_per_customer > 0;
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
    return [...acc, ...placementGroup.linodes.map((linode) => linode.linode)];
  }, []);

  return Array.from(new Set(linodeIds));
};

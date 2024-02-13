import {
  getPlacementGroupLinodeCount,
  hasPlacementGroupReachedCapacity,
} from 'src/features/PlacementGroups/utils';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useRegionsQuery } from 'src/queries/regions';

import type { APIError, Linode, PlacementGroup, Region } from '@linode/api-v4';
import type { Filter } from '@linode/api-v4';

interface PlacementGroupLimits {
  assignedLinodes: Linode[];
  hasReachedCapacity: boolean;
  isLoading: boolean;
  linodesCount: number;
  linodesError: APIError[] | null;
  region: Region | undefined;
}

interface PlacementGroupLimitsOptions {
  linodeQueryFilters?: Filter;
  placementGroup: PlacementGroup | undefined;
}

/**
 * Helper hook to fetch data we always need when working with Placement Groups.
 */
export const usePlacementGroupData = ({
  linodeQueryFilters,
  placementGroup,
}: PlacementGroupLimitsOptions): PlacementGroupLimits => {
  const { data: linodes, error, isLoading } = useAllLinodesQuery(
    linodeQueryFilters && {},
    linodeQueryFilters
  );
  const { data: regions } = useRegionsQuery();

  const region = regions?.find(
    (region) => region.id === placementGroup?.region
  );

  if (!linodes || !regions || !placementGroup) {
    return {
      assignedLinodes: [],
      hasReachedCapacity: false,
      isLoading: false,
      linodesCount: 0,
      linodesError: [],
      region,
    };
  }

  const linodesCount = getPlacementGroupLinodeCount(placementGroup);
  const assignedLinodes = linodes?.filter((linode) =>
    placementGroup.linode_ids.includes(linode.id)
  );
  const hasReachedCapacity = hasPlacementGroupReachedCapacity({
    placementGroup,
    region,
  });

  return {
    assignedLinodes,
    hasReachedCapacity,
    isLoading,
    linodesCount,
    linodesError: error,
    region,
  };
};

import {
  getPlacementGroupLinodeCount,
  hasPlacementGroupReachedCapacity,
} from 'src/features/PlacementGroups/utils';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { APIError, Linode, PlacementGroup, Region } from '@linode/api-v4';

interface PlacementGroupLimits {
  assignedLinodes: Linode[];
  hasReachedCapacity: boolean;
  isLoading: boolean;
  linodesCount: number;
  linodesError: APIError[] | null;
  region: Region | undefined;
}

interface PlacementGroupLimitsOptions {
  placementGroup: PlacementGroup | undefined;
}

/**
 * Helper hook to fetch data we always need when working with Placement Groups.
 *
 * NOTE: the linodes are filtered by the linode_ids in the placement group by default.
 */
export const usePlacementGroupData = ({
  placementGroup,
}: PlacementGroupLimitsOptions): PlacementGroupLimits => {
  const { data: linodes, error, isLoading } = useAllLinodesQuery(
    {},
    {
      '+or': placementGroup?.members.map((member) => ({
        id: member.linode_id,
      })),
    }
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
    placementGroup.members.some((pgLinode) => pgLinode.linode_id === linode.id)
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

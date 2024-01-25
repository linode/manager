import { PlacementGroup } from '@linode/api-v4';

export type PlacementGroupsDrawerPropsBase = {
  onClose: () => void;
  open: boolean;
};

export type PlacementGroupsCreateDrawerProps = PlacementGroupsDrawerPropsBase & {
  onPlacementGroupCreated?: (placementGroup: PlacementGroup) => void;
  selectedRegionId?: string;
};

export type PlacementGroupsRenameDrawerProps = PlacementGroupsDrawerPropsBase & {
  onPlacementGroupRenamed?: (placementGroup: PlacementGroup) => void;
  selectedPlacementGroup: PlacementGroup | undefined;
};

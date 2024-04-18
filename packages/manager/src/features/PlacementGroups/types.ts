import { PlacementGroup, Region } from '@linode/api-v4';

export interface PlacementGroupsDrawerPropsBase {
  onClose: () => void;
  open: boolean;
}

export interface PlacementGroupsCreateDrawerProps {
  disabledPlacementGroupCreateButton: boolean;
  onClose: PlacementGroupsDrawerPropsBase['onClose'];
  onPlacementGroupCreate?: (placementGroup: PlacementGroup) => void;
  open: PlacementGroupsDrawerPropsBase['open'];
  selectedRegionId?: string;
}

export interface PlacementGroupsEditDrawerProps {
  disableEditButton: boolean;
  onClose: PlacementGroupsDrawerPropsBase['onClose'];
  onPlacementGroupEdit?: (placementGroup: PlacementGroup) => void;
  open: PlacementGroupsDrawerPropsBase['open'];
  region: Region | undefined;
  selectedPlacementGroup: PlacementGroup | undefined;
}

export interface PlacementGroupsAssignLinodesDrawerProps {
  onClose: PlacementGroupsDrawerPropsBase['onClose'];
  onLinodeAddedToPlacementGroup?: (placementGroup: PlacementGroup) => void;
  open: PlacementGroupsDrawerPropsBase['open'];
  region: Region | undefined;
  selectedPlacementGroup: PlacementGroup | undefined;
}

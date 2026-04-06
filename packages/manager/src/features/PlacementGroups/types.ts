import type { APIError, PlacementGroup, Region } from '@linode/api-v4';

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
  isFetching: boolean;
  onClose: PlacementGroupsDrawerPropsBase['onClose'];
  onPlacementGroupEdit?: (placementGroup: PlacementGroup) => void;
  open: PlacementGroupsDrawerPropsBase['open'];
  region: Region | undefined;
  selectedPlacementGroup: PlacementGroup | undefined;
  selectedPlacementGroupError: APIError[] | null;
}

export interface PlacementGroupsAssignLinodesDrawerProps {
  onClose: PlacementGroupsDrawerPropsBase['onClose'];
  onLinodeAddedToPlacementGroup?: (placementGroup: PlacementGroup) => void;
  open: PlacementGroupsDrawerPropsBase['open'];
  region: Region | undefined;
  selectedPlacementGroup: PlacementGroup | undefined;
}

import {
  CreatePlacementGroupPayload,
  PlacementGroup,
  RenamePlacementGroupPayload,
} from '@linode/api-v4';

export type PlacementGroupsDrawerPropsBase = {
  numberOfPlacementGroupsCreated?: number;
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

export type PlacementGroupDrawerFormikProps = RenamePlacementGroupPayload &
  CreatePlacementGroupPayload;

export type PlacementGroupsAssignLinodesDrawerProps = PlacementGroupsDrawerPropsBase & {
  onLinodeAddedToPlacementGroup?: (placementGroup: PlacementGroup) => void;
  selectedPlacementGroup: PlacementGroup | undefined;
};

import {
  CreatePlacementGroupPayload,
  PlacementGroup,
  UpdatePlacementGroupPayload,
} from '@linode/api-v4';

export type PlacementGroupsDrawerPropsBase = {
  numberOfPlacementGroupsCreated?: number;
  onClose: () => void;
  open: boolean;
};

export type PlacementGroupsCreateDrawerProps = PlacementGroupsDrawerPropsBase & {
  onPlacementGroupCreate?: (placementGroup: PlacementGroup) => void;
  selectedRegionId?: string;
};

export type PlacementGroupsEditDrawerProps = PlacementGroupsDrawerPropsBase & {
  onPlacementGroupEdit?: (placementGroup: PlacementGroup) => void;
  selectedPlacementGroup: PlacementGroup | undefined;
};

export type PlacementGroupDrawerFormikProps = UpdatePlacementGroupPayload &
  CreatePlacementGroupPayload;

export type PlacementGroupsAssignLinodesDrawerProps = PlacementGroupsDrawerPropsBase & {
  onLinodeAddedToPlacementGroup?: (placementGroup: PlacementGroup) => void;
  selectedPlacementGroup: PlacementGroup | undefined;
};

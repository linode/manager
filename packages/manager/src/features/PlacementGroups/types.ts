import { AffinityType, PlacementGroup } from '@linode/api-v4';

export type PlacementGroupMode = 'create' | 'edit';

export type PlacementGroupPropsBase = {
  mode: PlacementGroupMode;
  onClose: () => void;
  onPlacementGroupCreated?: (placementGroup: PlacementGroup) => void;
  open: boolean;
};

export type PlacementGroupCreateProps = PlacementGroupPropsBase & {
  currentPlacementGroup?: PlacementGroup | undefined;
  mode: 'create';
  selectedAffinityType?: AffinityType;
  selectedRegionId?: string;
};

export type PlacementGroupEditProps = PlacementGroupPropsBase & {
  currentPlacementGroup: PlacementGroup | undefined;
  mode: 'edit';
  selectedAffinityType: AffinityType;
  selectedRegionId: string;
};

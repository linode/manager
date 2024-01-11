import type { Region } from '../regions/types';

export type AffinityType = 'affinity' | 'anti-affinity';

export interface PlacementGroup {
  id: number;
  label: string;
  region: Region['id'];
  affinity_type: AffinityType;
  compliant: boolean;
  linode_ids: number[];
}

export type CreatePlacementGroupPayload = Pick<
  PlacementGroup,
  'label' | 'affinity_type' | 'region'
>;

import type { Region } from '../regions/types';

export type AffinityType = 'affinity' | 'anti-affinity';

export interface PlacementGroup {
  id: number;
  label: string;
  region: Region['id'];
  affinity_type: AffinityType;
  compliant: boolean;
  linode_ids: number[];
  limits: number;
}

export type CreatePlacementGroupPayload = Pick<
  PlacementGroup,
  'label' | 'affinity_type' | 'region'
>;

export type UpdatePlacementGroupPayload = Pick<PlacementGroup, 'label'>;

/**
 * Since the API expects an array of ONE linode id, we'll use a tuple here.
 */
export type AssignVMsToPlacementGroupPayload = [number];
export type UnassignVMsFromPlacementGroupPayload = [number];

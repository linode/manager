import type { Region } from '../regions/types';

export enum AffinityType {
  // eslint-disable-next-line no-unused-vars
  affinity = 'Affinity',
  // eslint-disable-next-line no-unused-vars
  anti_affinity = 'Anti-affinity',
}

export interface PlacementGroup {
  id: number;
  label: string;
  region: Region['id'];
  affinity_type: keyof typeof AffinityType;
  compliant: boolean;
  linode_ids: number[];
  capacity: number;
}

export type CreatePlacementGroupPayload = Pick<
  PlacementGroup,
  'label' | 'affinity_type' | 'region'
>;

export type RenamePlacementGroupPayload = Pick<PlacementGroup, 'label'>;

/**
 * Since the API expects an array of ONE linode id, we'll use a tuple here.
 */
export type AssignVMsToPlacementGroupPayload = [number];
export type UnassignVMsFromPlacementGroupPayload = [number];

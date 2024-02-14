import type { Region } from '../regions/types';

export const AFFINITY_TYPES = {
  affinity: 'Affinity',
  anti_affinity: 'Anti-affinity',
} as const;

export type AffinityType = keyof typeof AFFINITY_TYPES;

export interface PlacementGroup {
  id: number;
  label: string;
  region: Region['id'];
  affinity_type: AffinityType;
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
export type AssignLinodesToPlacementGroupPayload = {
  linodes: [number];
};
export type UnassignLinodesFromPlacementGroupPayload = {
  linodes: [number];
};

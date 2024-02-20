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
  is_compliant: boolean;
  linode_ids: number[];
}

// The `strict` parameter specifies whether placement groups should be ignored when looking for a host.
// TODO VM_Placement: figure out the values for each create flow (create, clone, migrate etc)
export type CreatePlacementGroupPayload = Pick<
  PlacementGroup,
  'label' | 'affinity_type' | 'region'
> & { strict: boolean };

export type RenamePlacementGroupPayload = Pick<PlacementGroup, 'label'>;

/**
 * Since the API expects an array of ONE linode id, we'll use a tuple here.
 */
export type AssignLinodesToPlacementGroupPayload = {
  linodes: [number];
  strict: boolean;
};
export type UnassignLinodesFromPlacementGroupPayload = {
  linodes: [number];
};

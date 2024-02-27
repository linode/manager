import type { Region } from '../regions/types';

export const AFFINITY_TYPES = {
  affinity: 'Affinity',
  anti_affinity: 'Anti-affinity',
} as const;

export type AffinityType = keyof typeof AFFINITY_TYPES;
export type AffinityEnforcement = 'Strict' | 'Flexible';

export interface PlacementGroup {
  id: number;
  label: string;
  region: Region['id'];
  affinity_type: AffinityType;
  is_compliant: boolean;
  linodes: {
    linode: number;
    is_compliant: boolean;
  }[];
  is_strict: boolean;
}

type PlacementGroupPayload = Pick<
  PlacementGroup,
  'id' | 'label' | 'affinity_type' | 'is_strict'
>;

export type LinodePlacementGroup = PlacementGroupPayload;

export type CreatePlacementGroupPayload = Omit<PlacementGroupPayload, 'id'> & {
  region: Region['id'];
};

export type UpdatePlacementGroupPayload = Pick<PlacementGroup, 'label'>;

/**
 * Since the API expects an array of ONE linode id, we'll use a tuple here.
 */
export type AssignLinodesToPlacementGroupPayload = {
  linodes: [number];
  /**
   * This parameter is silent in Cloud Manager, but still needs to be represented in the API types.
   */
  compliant_only?: boolean;
};

export type UnassignLinodesFromPlacementGroupPayload = {
  linodes: [number];
};

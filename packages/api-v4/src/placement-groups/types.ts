import type { Region } from '../regions/types';

export const PLACEMENT_GROUP_TYPES = {
  'affinity:local': 'Affinity',
  'anti_affinity:local': 'Anti-affinity',
} as const;

export const PLACEMENT_GROUP_POLICIES = {
  strict: 'Strict',
  flexible: 'Flexible',
} as const;

export type PlacementGroupType = keyof typeof PLACEMENT_GROUP_TYPES;
export type PlacementGroupPolicy = keyof typeof PLACEMENT_GROUP_POLICIES;

export interface PlacementGroup {
  id: number;
  is_compliant: boolean;
  label: string;
  members: {
    is_compliant: boolean;
    linode_id: number;
  }[];
  migrations: null | {
    inbound?: Array<{ linode_id: number }>;
    outbound?: Array<{ linode_id: number }>;
  };
  placement_group_policy: PlacementGroupPolicy;
  placement_group_type: PlacementGroupType;
  region: Region['id'];
}

export interface LinodePlacementGroupPayload
  extends Pick<
    PlacementGroup,
    'id' | 'label' | 'placement_group_policy' | 'placement_group_type'
  > {
  migrating_to: null | number;
}

export interface CreatePlacementGroupPayload
  extends Omit<LinodePlacementGroupPayload, 'id' | 'migrating_to'> {
  region: Region['id'];
}

export type UpdatePlacementGroupPayload = Pick<PlacementGroup, 'label'>;

/**
 * Since the API expects an array of ONE linode id, we'll use a tuple here.
 */
export type AssignLinodesToPlacementGroupPayload = {
  /**
   * This parameter is silent in Cloud Manager, but still needs to be represented in the API types.
   *
   * @default false
   */
  compliant_only?: boolean;
  linodes: [number];
};

export type UnassignLinodesFromPlacementGroupPayload = {
  linodes: [number];
};

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
  label: string;
  region: Region['id'];
  placement_group_type: PlacementGroupType;
  is_compliant: boolean;
  members: {
    linode_id: number;
    is_compliant: boolean;
  }[];
  placement_group_policy: PlacementGroupPolicy;
  migrations: {
    inbound?: Array<{ linode_id: number }>;
    outbound?: Array<{ linode_id: number }>;
  } | null;
}

export interface PlacementGroupPayload
  extends Pick<
    PlacementGroup,
    'id' | 'label' | 'placement_group_type' | 'placement_group_policy'
  > {
  migrating_to?: number | 'None';
}

export interface CreatePlacementGroupPayload
  extends Omit<PlacementGroupPayload, 'id'> {
  region: Region['id'];
}

export type UpdatePlacementGroupPayload = Pick<PlacementGroup, 'label'>;

/**
 * Since the API expects an array of ONE linode id, we'll use a tuple here.
 */
export type AssignLinodesToPlacementGroupPayload = {
  linodes: [number];
  /**
   * This parameter is silent in Cloud Manager, but still needs to be represented in the API types.
   *
   * @default false
   */
  compliant_only?: boolean;
};

export type UnassignLinodesFromPlacementGroupPayload = {
  linodes: [number];
};

import type {
  AccountAccessRole,
  EntityAccessRole,
  EntityType,
  EntityTypePermissions,
  IamAccessType,
  PermissionType,
} from '@linode/api-v4';

export interface EntitiesOption {
  label: string;
  value: number;
}

export interface RoleView {
  access: 'account_access' | 'entity_access';
  description: string;
  entity_ids: null | number[];
  entity_type: EntityTypePermissions;
  id: AccountAccessRole | EntityAccessRole;
  name: AccountAccessRole | EntityAccessRole;
  permissions: PermissionType[];
}
export interface ExtendedRoleView extends RoleView {
  entity_names?: string[];
}

export interface EntitiesRole {
  access: IamAccessType;
  entity_id: number;
  entity_name: string;
  entity_type: EntityType | EntityTypePermissions;
  id: string;
  role_name: EntityAccessRole;
}

export interface CombinedEntity {
  id: number;
  name: string;
}

/**
 * DrawerModes:
 * - 'assign-role': Default mode for assigning roles.
 * - 'change-role': In this mode, the Entities component is read-only.
 * - 'change-role-for-entity': In this mode, the Entities component is hidden.
 */
export type DrawerModes =
  | 'assign-role'
  | 'change-role'
  | 'change-role-for-entity';

export interface FilteredRolesOptions {
  entityType?: 'all' | EntityType | EntityTypePermissions;
  getSearchableFields: (role: EntitiesRole | ExtendedRoleView) => string[];
  query: string;
  roles: EntitiesRole[] | RoleView[];
}

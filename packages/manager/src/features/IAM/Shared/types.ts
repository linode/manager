import type {
  AccessType,
  AccountRoleType,
  EntityRoleType,
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
  entity_type: AccessType;
  id: AccountRoleType | EntityRoleType;
  name: AccountRoleType | EntityRoleType;
  permissions: PermissionType[];
}
export interface ExtendedRoleView extends RoleView {
  entity_names?: string[];
}

export interface EntitiesRole {
  access: IamAccessType;
  entity_id: number;
  entity_name: string;
  entity_type: AccessType;
  id: string;
  role_name: EntityRoleType;
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
  entityType?: 'all' | AccessType;
  getSearchableFields: (role: EntitiesRole | ExtendedRoleView) => string[];
  query: string;
  roles: EntitiesRole[] | RoleView[];
}

import type { EntityTypePermissions, IamAccessType } from '@linode/api-v4';

export interface EntitiesOption {
  label: string;
  value: number;
}

export interface UiRole {
  access: IamAccessType;
  entity_type: EntityTypePermissions;
  label: string;
  value: string;
}

export interface AssignRolesForm {
  roles: {
    entities?: EntitiesOption[] | null;
    role: UiRole | null;
  }[];
}

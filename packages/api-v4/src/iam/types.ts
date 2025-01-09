export type ResourceTypePermissions =
  | 'linode'
  | 'firewall'
  | 'nodebalancer'
  | 'longview'
  | 'domain'
  | 'stackscript'
  | 'image'
  | 'volume'
  | 'database'
  | 'account'
  | 'vpc';

export type AccountAccessType =
  | 'account_linode_admin'
  | 'linode_creator'
  | 'linode_contributor'
  | 'firewall_creator';

export type RoleType =
  | 'linode_contributor'
  | 'firewall_admin'
  | 'linode_creator'
  | 'firewall_creator';

export interface IamUserPermissions {
  account_access: AccountAccessType[];
  resource_access: ResourceAccess[];
}
export interface ResourceAccess {
  resource_id: number;
  resource_type: ResourceTypePermissions;
  roles: RoleType[];
}

type PermissionType =
  | 'create_linode'
  | 'update_linode'
  | 'update_firewall'
  | 'delete_linode'
  | 'view_linode';

export interface IamAccountPermissions {
  account_access: IamAccess[];
  resource_access: IamAccess[];
}

export interface IamAccess {
  resource_type: ResourceTypePermissions;
  roles: Roles[];
}

export interface Roles {
  name: string;
  description: string;
  permissions: PermissionType[];
}

export type IamAccessType = keyof IamAccountPermissions;

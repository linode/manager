export interface IamUserPermissions {
  account_access: AccountAccessType[];
  resource_access: ResourceAccess[];
}

type ResourceType =
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

type AccountAccessType =
  | 'account_linode_admin'
  | 'linode_creator'
  | 'firewall_creator';

type RoleType = 'linode_contributor' | 'firewall_admin';

export interface ResourceAccess {
  resource_id: number;
  resource_type: ResourceType;
  roles: RoleType[];
}

export interface IamAccountPermissions {
  account_access: Access[];
  resource_access: Access[];
}

type PermissionType =
  | 'create_linode'
  | 'update_linode'
  | 'update_firewall'
  | 'delete_linode'
  | 'view_linode';

interface Access {
  resource_type: ResourceType;
  roles: Roles[];
}

export interface Roles {
  name: string;
  description: string;
  permissions?: PermissionType[];
}
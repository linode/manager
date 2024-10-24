export interface UserPermissions {
  account_access: string[];
  resource_access: ResourceAccess[];
}

export interface ResourceAccess {
  resource_id: string;
  resource_type: string;
  roles: string[];
}

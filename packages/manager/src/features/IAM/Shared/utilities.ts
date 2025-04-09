import { capitalize } from '@linode/utilities';

import { useFlags } from 'src/hooks/useFlags';

import type {
  AccountAccessType,
  IamAccess,
  IamAccessType,
  IamAccountPermissions,
  PermissionType,
  ResourceType,
  ResourceTypePermissions,
  RoleType,
  Roles,
} from '@linode/api-v4';

/**
 * Hook to determine if the IAM feature should be visible to the user.
 * Based on the user's account capability and the feature flag.
 *
 * @returns {boolean} - Whether the IAM feature is enabled for the current user.
 */
export const useIsIAMEnabled = () => {
  const flags = useFlags();

  const isIAMEnabled = flags.iam?.enabled;

  return {
    isIAMBeta: flags.iam?.beta,
    isIAMEnabled,
  };
};

export const placeholderMap: Record<string, string> = {
  account: 'Select Account',
  database: 'Select Databases',
  domain: 'Select Domains',
  firewall: 'Select Firewalls',
  image: 'Select Images',
  linode: 'Select Linodes',
  longview: 'Select Longviews',
  nodebalancer: 'Select Nodebalancers',
  stackscript: 'Select Stackscripts',
  volume: 'Select Volumes',
  vpc: 'Select VPCs',
};

export interface RoleMap {
  access: 'account' | 'resource';
  description: string;
  id: AccountAccessType | RoleType;
  name: AccountAccessType | RoleType;
  permissions: PermissionType[];
  resource_ids: null | number[];
  resource_type: ResourceTypePermissions;
}
export interface ExtendedRoleMap extends RoleMap {
  resource_names?: string[];
}

interface FilteredRolesOptions {
  entityType?: ResourceType | ResourceTypePermissions;
  getSearchableFields: (role: EntitiesRole | ExtendedRoleMap) => string[];
  query: string;
  roles: EntitiesRole[] | RoleMap[];
}

export const getFilteredRoles = (options: FilteredRolesOptions) => {
  const { entityType, getSearchableFields, query, roles } = options;

  return roles.filter((role: ExtendedRoleMap) => {
    if (query && entityType) {
      return (
        getDoesRolesMatchQuery(query, role, getSearchableFields) &&
        getDoesRolesMatchType(entityType, role)
      );
    }

    if (query) {
      return getDoesRolesMatchQuery(query, role, getSearchableFields);
    }

    if (entityType) {
      return getDoesRolesMatchType(entityType, role);
    }

    return true;
  });
};

/**
 * Checks if the given Role has a type
 *
 * @param resourceType The type to check for
 * @param role The role to compare against
 * @returns true if the given role has the given type
 */
const getDoesRolesMatchType = (
  resourceType: ResourceType | ResourceTypePermissions,
  role: ExtendedRoleMap
) => {
  return role.resource_type === resourceType;
};

/**
 * Compares a Role details to a given text search query
 *
 * @param query the current search query
 * @param role the Role to compare aginst
 * @param getSearchableFields the current searchableFields
 * @returns true if the Role matches the given query
 */
const getDoesRolesMatchQuery = (
  query: string,
  role: ExtendedRoleMap,
  getSearchableFields: (role: EntitiesRole | ExtendedRoleMap) => string[]
) => {
  const queryWords = query.trim().toLocaleLowerCase().split(' ');

  const searchableFields = getSearchableFields(role);

  return searchableFields.some((field) =>
    queryWords.some((queryWord) => field.toLowerCase().includes(queryWord))
  );
};

export interface RolesType {
  label: string;
  value: string;
}

interface ExtendedRole extends Roles {
  access: IamAccessType;
  resource_type: ResourceTypePermissions;
}

export const getAllRoles = (
  permissions: IamAccountPermissions
): RolesType[] => {
  const accessTypes: IamAccessType[] = ['account_access', 'resource_access'];

  return accessTypes.flatMap((accessType: IamAccessType) =>
    permissions[accessType].flatMap((resource: IamAccess) =>
      resource.roles.map((role: Roles) => ({
        label: role.name,
        value: role.name,
      }))
    )
  );
};

export const getRoleByName = (
  accountPermissions: IamAccountPermissions,
  roleName: string
): ExtendedRole | null => {
  const accessTypes: IamAccessType[] = ['account_access', 'resource_access'];

  for (const permissionType of accessTypes) {
    const resources = accountPermissions[permissionType];
    for (const resource of resources) {
      const role = resource.roles.find((role: Roles) => role.name === roleName);
      if (role) {
        return {
          ...role,
          access: permissionType, // Include access type (account or resource)
          resource_type: resource.resource_type,
        };
      }
    }
  }
  return null;
};

export interface EntitiesRole {
  id: string;
  resource_id: number;
  resource_name: string;
  resource_type: ResourceType | ResourceTypePermissions;
  role_name: RoleType;
}

export interface EntitiesType {
  label: string;
  rawValue: ResourceType | ResourceTypePermissions;
  value?: string;
}

export const mapEntityTypes = (
  data: EntitiesRole[] | RoleMap[],
  suffix: string
): EntitiesType[] => {
  const resourceTypes = Array.from(new Set(data.map((el) => el.resource_type)));

  return resourceTypes.map((resource) => ({
    label: capitalize(resource) + suffix,
    rawValue: resource,
    value: capitalize(resource) + suffix,
  }));
};

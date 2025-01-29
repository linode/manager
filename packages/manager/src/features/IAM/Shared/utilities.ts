import { useFlags } from 'src/hooks/useFlags';

import type {
  AccountAccessType,
  PermissionType,
  ResourceTypePermissions,
  RoleType,
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

interface FilteredRolesOptions {
  query: string;
  resourceType?: string;
  roles: RoleMap[];
}

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

export const getFilteredRoles = (options: FilteredRolesOptions) => {
  const { query, resourceType, roles } = options;

  return roles.filter((role: ExtendedRoleMap) => {
    if (query && resourceType) {
      return (
        getDoesRolesMatchQuery(query, role) &&
        getDoesRolesMatchType(resourceType, role)
      );
    }

    if (query) {
      return getDoesRolesMatchQuery(query, role);
    }

    if (resourceType) {
      return getDoesRolesMatchType(resourceType, role);
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
const getDoesRolesMatchType = (resourceType: string, role: ExtendedRoleMap) => {
  return role.resource_type === resourceType;
};

/**
 * Compares a Role details to a given text search query
 *
 * @param query the current search query
 * @param role the Role to compare aginst
 * @returns true if the Role matches the given query
 */
const getDoesRolesMatchQuery = (query: string, role: ExtendedRoleMap) => {
  const queryWords = query
    .replace(/[,.-]/g, '')
    .trim()
    .toLocaleLowerCase()
    .split(' ');
  const resourceNames = role.resource_names || [];

  const searchableFields = [
    String(role.id),
    role.resource_type,
    role.name,
    role.access,
    role.description,
    ...resourceNames,
    ...role.permissions,
  ];

  return searchableFields.some((field) =>
    queryWords.some((queryWord) => field.toLowerCase().includes(queryWord))
  );
};

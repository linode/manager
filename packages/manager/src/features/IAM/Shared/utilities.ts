import { capitalize } from '@linode/utilities';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import type {
  AccountAccessType,
  IamAccess,
  IamAccessType,
  IamAccountPermissions,
  IamAccountResource,
  IamUserPermissions,
  PermissionType,
  ResourceAccess,
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
  access: 'account_access' | 'resource_access';
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
  access: IamAccessType;
  label: string;
  resource_type: ResourceTypePermissions;
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
        access: accessType,
        label: role.name,
        resource_type: resource.resource_type,
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

export interface CombinedRoles {
  id: null | number[];
  name: AccountAccessType | RoleType;
}

/**
 * Group account_access and resource_access roles of the user
 *
 */
export const combineRoles = (data: IamUserPermissions): CombinedRoles[] => {
  const combinedRoles: CombinedRoles[] = [];
  const roleMap: Map<AccountAccessType | RoleType, null | number[]> = new Map();

  // Add account access roles with resource_id set to null
  data.account_access.forEach((role: AccountAccessType) => {
    if (!roleMap.has(role)) {
      roleMap.set(role, null);
    }
  });

  // Add resource access roles with their respective resource_id
  data.resource_access.forEach(
    (resource: { resource_id: number; roles: RoleType[] }) => {
      resource.roles?.forEach((role: RoleType) => {
        if (roleMap.has(role)) {
          const existingResourceIds = roleMap.get(role);
          if (existingResourceIds && existingResourceIds !== null) {
            existingResourceIds.push(resource.resource_id);
          }
        } else {
          roleMap.set(role, [resource.resource_id]);
        }
      });
    }
  );

  // Convert the Map into the final combinedRoles array
  roleMap.forEach((id, name) => {
    combinedRoles.push({ id, name });
  });

  return combinedRoles;
};

interface AllResources {
  resource: IamAccess;
  type: 'account_access' | 'resource_access';
}

/**
 * Add descriptions, permissions, type to roles
 */
export const mapRolesToPermissions = (
  accountPermissions: IamAccountPermissions,
  userRoles: CombinedRoles[]
): RoleMap[] => {
  const roleMap = new Map<string, RoleMap>();

  // Flatten resources and map roles for quick lookup
  const allResources: AllResources[] = [
    ...accountPermissions.account_access.map((resource) => ({
      resource,
      type: 'account_access' as const,
    })),
    ...accountPermissions.resource_access.map((resource) => ({
      resource,
      type: 'resource_access' as const,
    })),
  ];

  const roleLookup = new Map<string, AllResources>();
  allResources.forEach(({ resource, type }) => {
    resource.roles.forEach((role: Roles) => {
      roleLookup.set(role.name, { resource, type });
    });
  });

  // Map userRoles to permissions
  userRoles.forEach(({ id, name }) => {
    const match = roleLookup.get(name);
    if (match) {
      const { resource, type } = match;
      const role = resource.roles.find((role: Roles) => role.name === name)!;
      roleMap.set(name, {
        access: type,
        description: role.description,
        id: name,
        name,
        permissions: role.permissions,
        resource_ids: id,
        resource_type: resource.resource_type,
      });
    }
  });

  return Array.from(roleMap.values());
};

/**
 * Add assigned entities to role
 */
export const addResourceNamesToRoles = (
  roles: ExtendedRoleMap[],
  resources: IamAccountResource
): ExtendedRoleMap[] => {
  const resourcesArray: IamAccountResource[] = Object.values(resources);

  return roles.map((role) => {
    // Find the resource group by resource_type
    const resourceGroup = resourcesArray.find(
      (res) => res.resource_type === role.resource_type
    );

    if (resourceGroup && role.resource_ids) {
      // Map resource_ids to their names
      const resourceNames = role.resource_ids
        .map(
          (id) =>
            resourceGroup.resources.find((resource) => resource.id === id)?.name
        )
        .filter((name): name is string => name !== undefined); // Remove undefined values

      return { ...role, resource_names: resourceNames };
    }

    // If no matching resource_type, return the role unchanged
    return { ...role, resource_names: [] };
  });
};

/**
 * Custom hook to calculate hidden items
 */
export const useCalculateHiddenItems = (
  items: PermissionType[] | string[],
  showAll?: boolean
) => {
  const [numHiddenItems, setNumHiddenItems] = React.useState<number>(0);

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const itemRefs = React.useRef<(HTMLDivElement | HTMLSpanElement)[]>([]);

  const calculateHiddenItems = React.useCallback(() => {
    if (showAll || !containerRef.current) {
      setNumHiddenItems(0);
      return;
    }

    if (!itemRefs.current) {
      return;
    }

    const containerBottom = containerRef.current.getBoundingClientRect().bottom;

    const itemsArray = Array.from(itemRefs.current);

    const firstHiddenIndex = itemsArray.findIndex(
      (item: HTMLDivElement | HTMLSpanElement) => {
        const rect = item.getBoundingClientRect();
        return rect.top >= containerBottom;
      }
    );

    const numHiddenItems =
      firstHiddenIndex !== -1 ? itemsArray.length - firstHiddenIndex : 0;

    setNumHiddenItems(numHiddenItems);
  }, [items, showAll]);

  return { calculateHiddenItems, containerRef, itemRefs, numHiddenItems };
};

export interface EntitiesOption {
  label: string;
  value: number;
}

interface UpdateUserRolesProps {
  access: 'account_access' | 'resource_access';
  assignedRoles?: IamUserPermissions;
  initialRole?: string;
  newRole: string;
}

export const updateUserRoles = ({
  access,
  assignedRoles,
  initialRole,
  newRole,
}: UpdateUserRolesProps): IamUserPermissions => {
  if (access === 'account_access' && assignedRoles) {
    return {
      ...assignedRoles,
      account_access: assignedRoles.account_access.map(
        (role: AccountAccessType) =>
          role === initialRole ? (newRole as AccountAccessType) : role
      ),
    };
  }

  if (access === 'resource_access' && assignedRoles) {
    return {
      ...assignedRoles,
      resource_access: assignedRoles.resource_access.map(
        (resource: ResourceAccess) => ({
          ...resource,
          roles: resource.roles.map((role: RoleType) =>
            role === initialRole ? (newRole as RoleType) : role
          ),
        })
      ),
    };
  }

  // If access type is invalid, return unchanged object
  return (
    assignedRoles ?? {
      account_access: [],
      resource_access: [],
    }
  );
};

export interface AssignNewRoleFormValues {
  roles: {
    role: RolesType | null;
  }[];
}
interface DeleteUserRolesProps {
  access?: 'account_access' | 'resource_access';
  assignedRoles?: IamUserPermissions;
  initialRole?: string;
}

export const deleteUserRole = ({
  access,
  assignedRoles,
  initialRole,
}: DeleteUserRolesProps): IamUserPermissions => {
  if (access === 'account_access' && assignedRoles) {
    return {
      ...assignedRoles,
      account_access: assignedRoles.account_access.filter(
        (role: AccountAccessType) => role !== initialRole
      ),
    };
  }

  if (access === 'resource_access' && assignedRoles) {
    return {
      ...assignedRoles,
      resource_access: assignedRoles.resource_access
        .map((resource: ResourceAccess) => ({
          ...resource,
          roles: resource.roles.filter(
            (role: RoleType) => role !== initialRole
          ),
        }))
        .filter((resource: ResourceAccess) => resource.roles.length > 0),
    };
  }

  // If access type is invalid, return unchanged object
  return (
    assignedRoles ?? {
      account_access: [],
      resource_access: [],
    }
  );
};

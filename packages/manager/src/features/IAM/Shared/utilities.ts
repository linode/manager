import { capitalizeAllWords } from '@linode/utilities';

import type {
  AccountAccessRole,
  AccountEntity,
  EntityAccess,
  EntityAccessRole,
  EntityType,
  EntityTypePermissions,
  IamAccess,
  IamAccessType,
  IamAccountPermissions,
  IamUserPermissions,
  PermissionType,
  Roles,
} from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';

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
  access: 'account_access' | 'entity_access';
  description: string;
  entity_ids: null | number[];
  entity_type: EntityTypePermissions;
  id: AccountAccessRole | EntityAccessRole;
  name: AccountAccessRole | EntityAccessRole;
  permissions: PermissionType[];
}
export interface ExtendedRoleMap extends RoleMap {
  entity_names?: string[];
}

interface FilteredRolesOptions {
  entityType?: EntityType | EntityTypePermissions;
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
 * @param entityType The type to check for
 * @param role The role to compare against
 * @returns true if the given role has the given type
 */
const getDoesRolesMatchType = (
  entityType: EntityType | EntityTypePermissions,
  role: ExtendedRoleMap
) => {
  return role.entity_type === entityType;
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
  entity_type: EntityTypePermissions;
  label: string;
  value: string;
}

export interface ExtendedRole extends Roles {
  access: IamAccessType;
  entity_type: EntityTypePermissions;
}

export interface ExtendedEntityRole extends EntitiesRole {
  label: EntityAccessRole;
  value: EntityAccessRole;
}

export const getAllRoles = (
  permissions: IamAccountPermissions
): RolesType[] => {
  const accessTypes: IamAccessType[] = ['account_access', 'entity_access'];

  return accessTypes.flatMap((accessType: IamAccessType) =>
    permissions[accessType].flatMap((resource: IamAccess) =>
      resource.roles.map((role: Roles) => ({
        access: accessType,
        entity_type: resource.type,
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
  const accessTypes: IamAccessType[] = ['account_access', 'entity_access'];

  for (const permissionType of accessTypes) {
    const resources = accountPermissions[permissionType];
    for (const resource of resources) {
      const role = resource.roles.find((role: Roles) => role.name === roleName);
      if (role) {
        return {
          ...role,
          access: permissionType, // Include access type (account or resource)
          entity_type: resource.type,
        };
      }
    }
  }
  return null;
};

export interface EntitiesRole {
  access: IamAccessType;
  entity_id: number;
  entity_name: string;
  entity_type: EntityType | EntityTypePermissions;
  id: string;
  role_name: EntityAccessRole;
}

export interface EntitiesType {
  label: string;
  rawValue?: EntityType | EntityTypePermissions;
  value?: string;
}

export const mapEntityTypes = (
  data: EntitiesRole[] | RoleMap[],
  suffix: string
): EntitiesType[] => {
  const entityTypes = Array.from(new Set(data.map((el) => el.entity_type)));

  return entityTypes.map((entity) => ({
    label: capitalizeAllWords(entity, '_') + suffix,
    rawValue: entity,
    value: capitalizeAllWords(entity, '_') + suffix,
  }));
};

export const mapEntityTypesForSelect = (
  data: EntitiesRole[] | RoleMap[],
  suffix: string
): SelectOption[] => {
  const entityTypes = Array.from(new Set(data?.map((el) => el.entity_type)));

  return entityTypes
    .map((entity) => ({
      label: capitalizeAllWords(entity, '_') + suffix,
      value: entity,
    }))
    .sort((a, b) => (a?.value ?? '').localeCompare(b?.value ?? ''));
};

export interface CombinedRoles {
  id: null | number[];
  name: AccountAccessRole | EntityAccessRole;
}

/**
 * Group account_access and entity_access roles of the user
 *
 */
export const combineRoles = (data: IamUserPermissions): CombinedRoles[] => {
  const combinedRoles: CombinedRoles[] = [];
  const roleMap: Map<AccountAccessRole | EntityAccessRole, null | number[]> =
    new Map();

  // Add account access roles with resource_id set to null
  data.account_access.forEach((role: AccountAccessRole) => {
    if (!roleMap.has(role)) {
      roleMap.set(role, null);
    }
  });

  // Add resource access roles with their respective resource_id
  data.entity_access.forEach(
    (resource: { id: number; roles: EntityAccessRole[] }) => {
      resource.roles?.forEach((role: EntityAccessRole) => {
        if (roleMap.has(role)) {
          const existingResourceIds = roleMap.get(role);
          if (existingResourceIds && existingResourceIds !== null) {
            existingResourceIds.push(resource.id);
          }
        } else {
          roleMap.set(role, [resource.id]);
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
  type: 'account_access' | 'entity_access';
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
    ...accountPermissions.entity_access.map((resource) => ({
      resource,
      type: 'entity_access' as const,
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
        entity_ids: id,
        entity_type: resource.type,
        id: name,
        name,
        permissions: role.permissions,
      });
    }
  });

  return Array.from(roleMap.values());
};

/**
 * Add descriptions, permissions, type to roles
 */
export const mapAccountPermissionsToRoles = (
  accountPermissions: IamAccountPermissions
): RoleMap[] => {
  const mapperFn = (access: string, entity_type: string, role: Roles) => ({
    access,
    description: role.description,
    entity_type,
    id: role.name,
    name: role.name,
    permissions: role.permissions,
  });

  return [
    ...accountPermissions.account_access.map((ap) =>
      ap.roles.map(
        (role) => mapperFn('account_access', ap.type, role) as RoleMap
      )
    ),
    ...accountPermissions.entity_access.map((ap) =>
      ap.roles.map(
        (role) => mapperFn('entity_access', ap.type, role) as RoleMap
      )
    ),
  ].flat();
};

/**
 * Add assigned entities to role
 */

export const addEntitiesNamesToRoles = (
  roles: ExtendedRoleMap[],
  entities: Map<EntityType, Pick<AccountEntity, 'id' | 'label'>[]>
): ExtendedRoleMap[] => {
  return roles.map((role) => {
    // Find the resource group by entity_type
    const resourceGroup = entities.get(role.entity_type as EntityType);

    if (resourceGroup && role.entity_ids) {
      // Map entity_ids to their names
      const resourceNames = role.entity_ids
        .map(
          (id) => resourceGroup.find((resource) => resource.id === id)?.label
        )
        .filter((label): label is string => label !== undefined); // Remove undefined values

      return { ...role, entity_names: resourceNames };
    }

    // If no matching entity_type, return the role unchanged
    return { ...role, entity_names: [] };
  });
};

export interface EntitiesOption {
  label: string;
  value: number;
}

interface UpdateUserRolesProps {
  access: 'account_access' | 'entity_access';
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
        (role: AccountAccessRole) =>
          role === initialRole ? (newRole as AccountAccessRole) : role
      ),
    };
  }

  if (access === 'entity_access' && assignedRoles) {
    return {
      ...assignedRoles,
      entity_access: assignedRoles.entity_access.map(
        (resource: EntityAccess) => ({
          ...resource,
          roles: resource.roles.map((role: EntityAccessRole) =>
            role === initialRole ? (newRole as EntityAccessRole) : role
          ),
        })
      ),
    };
  }

  // If access type is invalid, return unchanged object
  return (
    assignedRoles ?? {
      account_access: [],
      entity_access: [],
    }
  );
};

export interface AssignNewRoleFormValues {
  roles: {
    entities?: EntitiesOption[] | null;
    role: null | RolesType;
  }[];
}

export interface UpdateEntitiesFormValues {
  entities: EntitiesOption[];
}

interface DeleteUserRolesProps {
  access?: 'account_access' | 'entity_access';
  assignedRoles?: IamUserPermissions;
  initialRole?: string;
}

export const deleteUserRole = ({
  access,
  assignedRoles,
  initialRole,
}: DeleteUserRolesProps): IamUserPermissions => {
  if (!assignedRoles) {
    return {
      account_access: [],
      entity_access: [],
    };
  }

  if (access === 'account_access') {
    return {
      ...assignedRoles,
      account_access: assignedRoles.account_access.filter(
        (role: AccountAccessRole) => role !== initialRole
      ),
    };
  }

  if (access === 'entity_access') {
    return {
      ...assignedRoles,
      entity_access: assignedRoles.entity_access
        .map((resource: EntityAccess) => ({
          ...resource,
          roles: resource.roles.filter(
            (role: EntityAccessRole) => role !== initialRole
          ),
        }))
        .filter((resource: EntityAccess) => resource.roles.length > 0),
    };
  }

  // If access type is invalid, return unchanged object
  return assignedRoles;
};

export const transformedAccountEntities = (
  entities: AccountEntity[]
): Map<EntityType, Pick<AccountEntity, 'id' | 'label'>[]> => {
  const result: Map<EntityType, Pick<AccountEntity, 'id' | 'label'>[]> =
    new Map();

  entities.forEach((item) => {
    if (!result.has(item.type)) {
      result.set(item.type, []);
    }

    result.get(item.type)?.push({
      id: item.id,
      label: item.label,
    });
  });

  return result;
};

export type DrawerModes =
  | 'assign-role'
  | 'change-role'
  | 'change-role-for-entity';

export const changeRoleForEntity = (
  entityRoles: EntityAccess[],
  entityId: number,
  entityType: EntityType | EntityTypePermissions,
  initialRole: EntityAccessRole,
  newRole: EntityAccessRole
): EntityAccess[] => {
  return [
    ...entityRoles.map((entity) => {
      const roles = Array.from(
        new Set(
          entity.roles.map((role) => (role === initialRole ? newRole : role))
        )
      );
      if (entity.type === entityType && entity.id === entityId) {
        return {
          ...entity,
          roles,
        };
      }
      return entity;
    }),
  ];
};

export const toEntityAccess = (
  entityRoles: EntityAccess[],
  entityIds: number[],
  roleName: EntityAccessRole,
  roleType: EntityTypePermissions
): EntityAccess[] => {
  const selectedIds = new Set(entityIds);

  const updatedEntityAccess = entityRoles
    .map((entity) => {
      if (selectedIds.has(entity.id)) {
        // Ensure the role is assigned to the entity
        if (!entity.roles.includes(roleName)) {
          return {
            ...entity,
            roles: [...entity.roles, roleName],
          };
        }
        return entity;
      }

      // Remove the role if the entity is not in the new entity IDs
      return {
        ...entity,
        roles: entity.roles.filter((role) => role !== roleName),
      };
    })
    .filter((entity) => entity.roles.length > 0); // Remove entities with no roles

  // Add new entities that don't exist in the current access
  const newEntities = Array.from(selectedIds)
    .filter((id) => !entityRoles.some((entity) => entity.id === id))
    .map((id) => ({
      id,
      roles: [roleName],
      type: roleType,
    }));

  return [...updatedEntityAccess, ...newEntities];
};

export interface CombinedEntity {
  id: number;
  name: string;
}

export const deleteUserEntity = (
  entityRoles: EntityAccess[],
  roleName: EntityAccessRole,
  entityId: number,
  entityType: EntityType | EntityTypePermissions
): EntityAccess[] => {
  return entityRoles
    .map((entity) => {
      if (entity.type === entityType && entity.id === entityId) {
        const roles = entity.roles.filter(
          (role: EntityAccessRole) => role !== roleName
        );
        return {
          ...entity,
          roles,
        };
      }

      return entity;
    })
    .filter((entity) => entity.roles.length > 0);
};

export const getCreateLinkForEntityType = (
  entityType: EntityType | EntityTypePermissions
): string => {
  // TODO - find the exceptions to this rule - most use the route of /{entityType}s/create (note the "s")
  return `/${entityType}s/create`;
};

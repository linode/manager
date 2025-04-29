import type { ExtendedRoleView, RoleView } from '../types';
import type {
  AccountAccessRole,
  AccountEntity,
  EntityAccessRole,
  EntityType,
  IamAccess,
  IamAccountPermissions,
  IamUserPermissions,
  Roles,
} from '@linode/api-v4';

interface AllResources {
  resource: IamAccess;
  type: 'account_access' | 'entity_access';
}

export interface CombinedRoles {
  id: null | number[];
  name: AccountAccessRole | EntityAccessRole;
}

// TODO - aaleksee - can this method's return value be typed as RoleView instead of simply string[]?
export const getSearchableFields = (role: ExtendedRoleView): string[] => {
  const entityNames = role.entity_names || [];
  return [
    String(role.id),
    role.entity_type,
    role.name,
    role.description,
    ...entityNames,
    ...role.permissions,
  ];
};

/**
 * Add assigned entities to role
 */
export const addEntitiesNamesToRoles = (
  roles: ExtendedRoleView[],
  entities: Map<EntityType, Pick<AccountEntity, 'id' | 'label'>[]>
): ExtendedRoleView[] => {
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

/**
 * Group account_access and entity_access roles of the user
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

/**
 * Add descriptions, permissions, type to assigned users roles
 */
export const mapRolesToPermissions = (
  accountPermissions: IamAccountPermissions,
  userRoles: CombinedRoles[]
): RoleView[] => {
  const roleMap = new Map<string, RoleView>();

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

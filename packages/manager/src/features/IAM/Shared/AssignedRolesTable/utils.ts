import { mapAccountPermissionsToRoles } from '../utilities';

import type { ExtendedRoleView, RoleView } from '../types';
import type {
  AccountEntity,
  AccountRoleType,
  EntityRoleType,
  EntityType,
  IamAccountRoles,
  IamUserRoles,
} from '@linode/api-v4';

export interface CombinedRoles {
  id: null | number[];
  name: AccountRoleType | EntityRoleType;
}

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
  return roles
    .map((role) => {
      // Find the entity group by entity_type
      const entityGroup = entities.get(role.entity_type as EntityType);

      if (entityGroup && role.entity_ids) {
        // Map entity_ids to their names
        const entityNames = role.entity_ids
          .map(
            (id) => entityGroup.find((resource) => resource.id === id)?.label
          )
          .filter((label): label is string => label !== undefined);

        // If the role has `entity_access` and no `entity_names`, exclude it
        // This can happen if the assigned entity was removed, and the `entityGroup` no longer contains that entity
        if (role.access === 'entity_access' && entityNames.length === 0) {
          return null;
        }

        return { ...role, entity_names: entityNames };
      }

      if (role.access === 'account_access') {
        return { ...role, entity_names: [] };
      }

      // For `entity_access` with no matching entity_type, exclude the role
      return null;
    })
    .filter((role) => role !== null);
};

/**
 * Group account_access and entity_access roles of the user
 */
export const combineRoles = (data: IamUserRoles): CombinedRoles[] => {
  const combinedRoles: CombinedRoles[] = [];
  const roleMap: Map<AccountRoleType | EntityRoleType, null | number[]> =
    new Map();

  // Add account access roles with resource_id set to null
  data.account_access.forEach((role: AccountRoleType) => {
    if (!roleMap.has(role)) {
      roleMap.set(role, null);
    }
  });

  // Add resource access roles with their respective resource_id
  data.entity_access.forEach(
    (resource: { id: number; roles: EntityRoleType[] }) => {
      resource.roles?.forEach((role: EntityRoleType) => {
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
 * Add descriptions, permissions, type, entities to assigned users roles
 */
export const mapRolesToPermissions = (
  accountPermissions: IamAccountRoles,
  userRoles: CombinedRoles[]
): RoleView[] => {
  const allRoles = mapAccountPermissionsToRoles(accountPermissions);

  const userRolesLookup = new Map<string, null | number[]>();
  userRoles.forEach(({ id, name }) => {
    userRolesLookup.set(name, id);
  });

  // Filter allRoles to include only the user's roles and add entity_ids
  return allRoles
    .filter((role) => userRolesLookup.has(role.name))
    .map((role) => ({
      ...role,
      entity_ids: userRolesLookup.get(role.name) || null,
    }));
};

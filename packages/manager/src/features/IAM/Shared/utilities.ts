import { capitalize, capitalizeAllWords } from '@linode/utilities';

import { PAID_ENTITY_TYPES } from './constants';

import type {
  EntitiesOption,
  EntitiesRole,
  ExtendedRoleView,
  FilteredRolesOptions,
  RoleView,
} from './types';
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
  Roles,
} from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';

export const getFilteredRoles = (options: FilteredRolesOptions) => {
  const { entityType, getSearchableFields, query, roles } = options;

  return roles.filter((role: ExtendedRoleView) => {
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
  entityType: 'all' | EntityType | EntityTypePermissions,
  role: ExtendedRoleView
) => {
  if (entityType === 'all') {
    return role;
  }
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
  role: ExtendedRoleView,
  getSearchableFields: (role: EntitiesRole | ExtendedRoleView) => string[]
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

export const mapEntityTypesForSelect = (
  data: EntitiesRole[] | RoleView[],
  suffix: string
): SelectOption[] => {
  const entityTypes = Array.from(new Set(data?.map((el) => el.entity_type)));

  return entityTypes
    .map((entity) => ({
      label: capitalizeAllWords(getFormattedEntityType(entity), '_') + suffix,
      value: entity,
    }))
    .sort((a, b) => (a?.value ?? '').localeCompare(b?.value ?? ''));
};

/**
 * Add descriptions, permissions, type to all roles
 */
export const mapAccountPermissionsToRoles = (
  accountPermissions: IamAccountPermissions
): RoleView[] => {
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
        (role) => mapperFn('account_access', ap.type, role) as RoleView
      )
    ),
    ...accountPermissions.entity_access.map((ap) =>
      ap.roles.map(
        (role) => mapperFn('entity_access', ap.type, role) as RoleView
      )
    ),
  ].flat();
};

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

export const groupAccountEntitiesByType = (
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

export const getFacadeRoleDescription = (
  role: ExtendedRole | ExtendedRoleView
): string => {
  if (role.access === 'account_access') {
    const dollarSign = PAID_ENTITY_TYPES.includes(role.entity_type)
      ? ' ($)'
      : '';

    return `This role grants the same access as the legacy "Can add ${getFormattedEntityType(role.entity_type)}s to this account${dollarSign}" global permissions.`;
  }

  if (role.access === 'entity_access') {
    const access = role.name.includes('admin') ? 'Read-Write' : 'Read-Only';

    return `This role grants the same access as the legacy ${access} special permission for the ${getFormattedEntityType(role.entity_type)}s attached to this role.`;
  }

  return role.description;
};

export const getFormattedEntityType = (entityType: string): string => {
  const overrideCapitalization: Record<string, string> = {
    vpc: 'VPC',
    stackscript: 'StackScript',
    nodebalancer: 'NodeBalancer',
  };

  // Return the overridden capitalization if it exists, otherwise capitalize normally
  return overrideCapitalization[entityType] || capitalize(entityType);
};

/**
 * Gets a list of roles selected from the UI, and merges them into the existing IAM roles that are
 * also passed in.  Returns the merged roles in IAM (back end) format.
 * Note: The UI format used here is role-centric - the user picks a role and associates it with
 * entities, but the backend format is entity-centric - it's a list of entities, each with a list
 * of roles associated with that entity.
 *
 * @param values the selected roles from the UI
 * @param existingRoles the existing IAM roles
 * @returns the merged IAM roles
 */
export const mergeAssignedRolesIntoExistingRoles = (
  values: AssignNewRoleFormValues,
  existingRoles: IamUserPermissions | undefined
): IamUserPermissions => {
  // Create an intermediary form that is easier to work with
  const selectedRoles = values.roles.map((r) => ({
    access: r.role?.access,
    entities: r.entities || null,
    role: r.role?.value,
  }));

  const selectedPlusExistingRoles: IamUserPermissions = {
    account_access: existingRoles?.account_access || [],
    entity_access: existingRoles?.entity_access || [],
  };

  if (selectedRoles.length) {
    // Add the selected Account level roles to the existing ones
    selectedRoles
      .filter((r) => r.access === 'account_access')
      .forEach((r) => {
        selectedPlusExistingRoles.account_access.push(
          r.role as AccountAccessRole
        );
      });

    // Add the selected Entity level roles to the existing ones
    selectedRoles
      .filter((r) => r.access === 'entity_access')
      .forEach((r) => {
        r.entities?.forEach((e) => {
          const existingEntity = selectedPlusExistingRoles.entity_access.find(
            (ee) => ee.id === e.value
          );
          if (existingEntity) {
            existingEntity.roles.push(r.role as EntityAccessRole);
          } else {
            selectedPlusExistingRoles.entity_access.push({
              id: e.value,
              roles: [r.role as EntityAccessRole],
              type: r.role?.split('_')[0] as EntityTypePermissions, // TODO - this needs to be cleaned up
            });
          }
        });
      });
  }

  return selectedPlusExistingRoles;
};

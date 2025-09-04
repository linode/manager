import { capitalize, capitalizeAllWords } from '@linode/utilities';

import {
  INTERNAL_ERROR_NO_CHANGES_SAVED,
  LAST_ACCOUNT_ADMIN_ERROR,
  PAID_ENTITY_TYPES,
} from './constants';

import type {
  EntitiesOption,
  EntitiesRole,
  ExtendedRoleView,
  FilteredRolesOptions,
  RoleView,
} from './types';
import type {
  AccessType,
  AccountEntity,
  AccountRoleType,
  APIError,
  EntityAccess,
  EntityRoleType,
  EntityType,
  IamAccess,
  IamAccessType,
  IamAccountRoles,
  IamUserRoles,
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
  entityType: 'all' | AccessType,
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
  entity_type: AccessType;
  label: string;
  value: string;
}

export interface ExtendedRole extends Roles {
  access: IamAccessType;
  entity_type: AccessType;
}

export interface ExtendedEntityRole extends EntitiesRole {
  label: EntityRoleType;
  value: EntityRoleType;
}

export const getAllRoles = (permissions: IamAccountRoles): RolesType[] => {
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
  accountPermissions: IamAccountRoles,
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
  accountPermissions: IamAccountRoles
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
  assignedRoles?: IamUserRoles;
  initialRole?: string;
  newRole: string;
}

export const changeUserRole = ({
  access,
  assignedRoles,
  initialRole,
  newRole,
}: UpdateUserRolesProps): IamUserRoles => {
  if (access === 'account_access' && assignedRoles) {
    return {
      ...assignedRoles,
      account_access: assignedRoles.account_access.map(
        (role: AccountRoleType) =>
          role === initialRole ? (newRole as AccountRoleType) : role
      ),
    };
  }

  if (access === 'entity_access' && assignedRoles) {
    return {
      ...assignedRoles,
      entity_access: assignedRoles.entity_access.map(
        (resource: EntityAccess) => ({
          ...resource,
          roles: resource.roles.map((role: EntityRoleType) =>
            role === initialRole ? (newRole as EntityRoleType) : role
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
  username?: null | string;
}

export interface UpdateEntitiesFormValues {
  entities: EntitiesOption[];
}

interface DeleteUserRolesProps {
  access?: 'account_access' | 'entity_access';
  assignedRoles?: IamUserRoles;
  initialRole?: string;
}

export const deleteUserRole = ({
  access,
  assignedRoles,
  initialRole,
}: DeleteUserRolesProps): IamUserRoles => {
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
        (role: AccountRoleType) => role !== initialRole
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
            (role: EntityRoleType) => role !== initialRole
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
  entityType: AccessType,
  initialRole: EntityRoleType,
  newRole: EntityRoleType
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
  roleName: EntityRoleType,
  roleType: AccessType
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
  roleName: EntityRoleType,
  entityId: number,
  entityType: AccessType
): EntityAccess[] => {
  return entityRoles
    .map((entity) => {
      if (entity.type === entityType && entity.id === entityId) {
        const roles = entity.roles.filter(
          (role: EntityRoleType) => role !== roleName
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
    lkecluster: 'Kubernetes Cluster',
    nodebalancer: 'NodeBalancer',
    placement_group: 'Placement Group',
    stackscript: 'StackScript',
    vpc: 'VPC',
  };

  // Return the overridden capitalization if it exists, otherwise capitalize normally
  return overrideCapitalization[entityType] || capitalize(entityType);
};

/**
 * Partitions an array into two results based on a predicate function.
 *
 * @param predicate - A function that takes an element and returns a boolean.
 * @param array - The array to partition.
 */
export const partition = <T>(
  array: T[],
  predicate: (value: T) => boolean
): [T[], T[]] => {
  const pass: T[] = [];
  const fail: T[] = [];

  array.forEach((value) => {
    if (predicate(value)) {
      pass.push(value);
    } else {
      fail.push(value);
    }
  });

  return [pass, fail];
};

/**
 * Gets a list of roles selected from the UI, and merges them into the existing IAM roles that are
 * also passed in.  Returns the merged roles in IAM (back end) format.
 * Note: The UI format used here is role-centric - the user picks a role and associates it with
 * entities, but the backend format is entity-centric - it's a list of entities, each with a list
 * of roles associated with that entity.
 *
 * @param selectedRoles the selected roles from the UI
 * @param existingRoles the existing IAM roles
 * @returns the merged IAM roles
 */
export const mergeAssignedRolesIntoExistingRoles = (
  selectedRoles: AssignNewRoleFormValues,
  existingRoles: IamUserRoles | undefined
): IamUserRoles => {
  // Set up what is going to be returned
  const selectedPlusExistingRoles: IamUserRoles = {
    account_access: existingRoles?.account_access || [],
    entity_access: existingRoles?.entity_access || [],
  };

  // Create an intermediary form of the two types of selected roles that is easier to work with
  const [selectedAccountAccessRoles, selectedEntityAccessRoles] = partition(
    selectedRoles.roles,
    (r) => r.role?.access === 'account_access'
  );

  // Add the selected Account level roles to the existing ones
  selectedAccountAccessRoles.forEach((r) => {
    // Don't push it on if it already exists
    if (
      !selectedPlusExistingRoles.account_access.includes(
        r.role?.value as AccountRoleType
      )
    ) {
      selectedPlusExistingRoles.account_access.push(
        r.role?.value as AccountRoleType
      );
    }
  });

  // Add the selected Entity level roles to the existing ones
  selectedEntityAccessRoles.forEach((r) => {
    r.entities?.forEach((e) => {
      const existingEntity = selectedPlusExistingRoles.entity_access.find(
        (ee) => ee.id === e.value
      );
      if (existingEntity) {
        // Don't push it on if it already exists
        if (!existingEntity.roles.includes(r.role?.value as EntityRoleType)) {
          existingEntity.roles.push(r.role?.value as EntityRoleType);
        }
      } else {
        selectedPlusExistingRoles.entity_access.push({
          id: e.value,
          roles: [r.role?.value as EntityRoleType],
          type: r.role?.entity_type as AccessType,
        });
      }
    });
  });
  return selectedPlusExistingRoles;
};

export const getErrorMessage = (error: APIError[] | null) => {
  const isLastAccountAdmin = error?.some(
    (err) =>
      err.reason === 'Must have at least one user with account_admin role'
  );

  const errorMessage = isLastAccountAdmin
    ? LAST_ACCOUNT_ADMIN_ERROR
    : INTERNAL_ERROR_NO_CHANGES_SAVED;

  return error ? errorMessage : undefined;
};

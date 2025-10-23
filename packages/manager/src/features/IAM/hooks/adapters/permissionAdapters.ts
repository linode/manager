import { accountGrantsToPermissions } from './accountGrantsToPermissions';
import { firewallGrantsToPermissions } from './firewallGrantsToPermissions';
import { imageGrantsToPermissions } from './imageGrantsToPermissions';
import { linodeGrantsToPermissions } from './linodeGrantsToPermissions';
import { nodeBalancerGrantsToPermissions } from './nodeBalancerGrantsToPermissions';
import { volumeGrantsToPermissions } from './volumeGrantsToPermissions';
import { vpcGrantsToPermissions } from './vpcGrantsToPermissions';

import type { EntityBase } from '../usePermissions';
import type {
  AccessType,
  EntityRoleType,
  EntityType,
  Grants,
  GrantType,
  IamAccountRoles,
  IamUserRoles,
  PermissionType,
  Profile,
} from '@linode/api-v4';

export type EntityPermissionMap = Record<number, PermissionMap>;

export type PermissionMap = Record<PermissionType, boolean>;

/** Convert entities and the permissions associated with the entity from grants */
export const entityPermissionMapFrom = (
  grants: Grants | undefined,
  grantType: GrantType,
  profile?: Profile
): EntityPermissionMap => {
  const entityPermissionsMap: EntityPermissionMap = {};
  if (grants) {
    grants[grantType]?.forEach((entity) => {
      /** Entity Permissions Maps */
      const firewallPermissionsMap = firewallGrantsToPermissions(
        entity?.permissions,
        profile?.restricted
      ) as PermissionMap;
      const linodePermissionsMap = linodeGrantsToPermissions(
        entity?.permissions,
        profile?.restricted
      ) as PermissionMap;
      const volumePermissionsMap = volumeGrantsToPermissions(
        entity?.permissions,
        profile?.restricted
      ) as PermissionMap;
      const nodebalancerPermissionsMap = nodeBalancerGrantsToPermissions(
        entity?.permissions,
        profile?.restricted
      ) as PermissionMap;
      const imagePermissionsMap = imageGrantsToPermissions(
        entity?.permissions,
        profile?.restricted
      ) as PermissionMap;
      const vpcPermissionsMap = vpcGrantsToPermissions(
        entity?.permissions,
        profile?.restricted
      ) as PermissionMap;

      /** Add entity permissions to map */
      switch (grantType) {
        case 'firewall':
          entityPermissionsMap[entity.id] = firewallPermissionsMap;
          break;
        case 'image':
          entityPermissionsMap[entity.id] = imagePermissionsMap;
          break;
        case 'linode':
          entityPermissionsMap[entity.id] = linodePermissionsMap;
          break;
        case 'nodebalancer':
          entityPermissionsMap[entity.id] = nodebalancerPermissionsMap;
          break;
        case 'volume':
          entityPermissionsMap[entity.id] = volumePermissionsMap;
          break;
        case 'vpc':
          entityPermissionsMap[entity.id] = vpcPermissionsMap;
          break;
      }
    });
  }
  return entityPermissionsMap;
};

/** Convert the existing Grant model to the new IAM RBAC model. */
export const fromGrants = (
  accessType: AccessType,
  permissionsToCheck: readonly PermissionType[],
  grants?: Grants,
  isRestricted?: boolean,
  entityId?: number | string
): PermissionMap => {
  // image IDs are stored as strings containing a private or public prefix. ex: "private/123456"
  // we need to extract the image ID from the string tp match the integer ID from the grants
  const imageId =
    typeof entityId === 'string' && entityId.includes('/')
      ? entityId.split('/')[1]
      : entityId;
  /** Find the entity in the grants */
  const firewall = grants?.firewall.find((f) => f.id === entityId);
  const image = grants?.image.find((f) => f.id.toString() === imageId);
  const linode = grants?.linode.find((f) => f.id === entityId);
  const volume = grants?.volume.find((f) => f.id === entityId);
  const nodebalancer = grants?.nodebalancer.find((f) => f.id === entityId);
  const vpc = grants?.vpc.find((f) => f.id === entityId);

  let usersPermissionsMap = {} as PermissionMap;

  /** Convert the entity permissions to the new IAM RBAC model */
  switch (accessType) {
    case 'account':
      usersPermissionsMap = accountGrantsToPermissions(
        grants?.global,
        isRestricted
      ) as PermissionMap;
      break;
    case 'firewall':
      usersPermissionsMap = firewallGrantsToPermissions(
        firewall?.permissions,
        isRestricted
      ) as PermissionMap;
      break;
    case 'image':
      usersPermissionsMap = imageGrantsToPermissions(
        image?.permissions,
        isRestricted
      ) as PermissionMap;
      break;
    case 'linode':
      usersPermissionsMap = linodeGrantsToPermissions(
        linode?.permissions,
        isRestricted
      ) as PermissionMap;
      break;
    case 'nodebalancer':
      usersPermissionsMap = nodeBalancerGrantsToPermissions(
        nodebalancer?.permissions,
        isRestricted
      ) as PermissionMap;
      break;
    case 'volume':
      usersPermissionsMap = volumeGrantsToPermissions(
        volume?.permissions,
        isRestricted
      ) as PermissionMap;
      break;
    case 'vpc':
      usersPermissionsMap = vpcGrantsToPermissions(
        vpc?.permissions,
        isRestricted
      ) as PermissionMap;
      break;
    default:
      throw new Error(`Unknown access type: ${accessType}`);
  }

  const permissionsMap = {} as PermissionMap;
  permissionsToCheck?.forEach(
    (permission) =>
      (permissionsMap[permission] = usersPermissionsMap[permission] ?? false)
  );

  return permissionsMap;
};

/** Combines a list of entities and the permissions associated with the entity */
export const toEntityPermissionMap = (
  entities: EntityBase[] | undefined,
  entitiesPermissions: (PermissionType[] | undefined)[] | undefined,
  permissionsToCheck: readonly PermissionType[],
  isRestricted?: boolean
): EntityPermissionMap => {
  const entityPermissionsMap: EntityPermissionMap = {};
  if (entities?.length && entitiesPermissions?.length) {
    entitiesPermissions?.forEach(
      (entityPermissions: PermissionType[], index: number) => {
        const permissionMap = toPermissionMap(
          permissionsToCheck,
          entityPermissions,
          isRestricted
        );
        entityPermissionsMap[entities[index].id] = permissionMap;
      }
    );
  }
  return entityPermissionsMap;
};

/** Combines the permissions a user wants to check with the permissions returned from the backend */
export const toPermissionMap = (
  permissionsToCheck: readonly PermissionType[],
  usersPermissions: PermissionType[],
  isRestricted?: boolean
): PermissionMap => {
  const unrestricted = isRestricted === false; // explicit === false since the profile can be undefined
  const usersPermissionMap = {} as PermissionMap;
  usersPermissions?.forEach(
    (permission) => (usersPermissionMap[permission] = true)
  );

  const permissionMap = {} as PermissionMap;
  permissionsToCheck?.forEach(
    (permission) =>
      (permissionMap[permission] =
        (unrestricted || usersPermissionMap[permission]) ?? false)
  );

  return permissionMap;
};

export const buildEntityPermissionMapFromUserRoles = <T extends EntityBase>(
  allEntities: T[] | undefined,
  userRoles: IamUserRoles | undefined,
  accountRoles: IamAccountRoles | undefined,
  entityType: EntityType,
  permissionsToCheck: PermissionType[],
  isRestricted?: boolean
): Record<number, Record<PermissionType, boolean>> => {
  const permissionMap: Record<number, Record<PermissionType, boolean>> = {};

  if (!allEntities || !userRoles || !accountRoles) {
    return permissionMap;
  }

  // Build a map of role names to their permissions
  const rolePermissionsMap = new Map<string, PermissionType[]>();

  // Get all role definitions for this entity type from accountRoles
  accountRoles.entity_access.forEach((access) => {
    if (access.type === entityType) {
      access.roles.forEach((role) => {
        rolePermissionsMap.set(role.name, role.permissions);
      });
    }
  });

  // Filter entity_access for the specific entityType we care about
  const relevantEntityAccess = userRoles.entity_access.filter(
    (access) => access.type === entityType
  );

  // Build a lookup map of entity ID to roles
  const entityRolesMap = new Map<number, EntityRoleType[]>();
  relevantEntityAccess.forEach((access) => {
    entityRolesMap.set(access.id, access.roles);
  });

  // For each entity, determine if they have the required permissions
  allEntities.forEach((entity) => {
    const entityRoles = entityRolesMap.get(entity.id) || [];

    // Collect all permissions granted by the user's roles for this entity
    const grantedPermissions = new Set<PermissionType>();
    entityRoles.forEach((roleName) => {
      const rolePermissions = rolePermissionsMap.get(roleName) || [];
      rolePermissions.forEach((permission) => {
        grantedPermissions.add(permission);
      });
    });

    // Build the permission map for this entity
    const entityPermissions: Record<string, boolean> = {};
    permissionsToCheck.forEach((permission) => {
      // If user is unrestricted, they have all permissions
      // Otherwise, check if the permission is in their granted permissions
      entityPermissions[permission] =
        isRestricted === false || grantedPermissions.has(permission);
    });

    permissionMap[entity.id] = entityPermissions as Record<
      PermissionType,
      boolean
    >;
  });

  return permissionMap;
};

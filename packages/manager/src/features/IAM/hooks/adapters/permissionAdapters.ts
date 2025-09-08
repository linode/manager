import { accountGrantsToPermissions } from './accountGrantsToPermissions';
import { firewallGrantsToPermissions } from './firewallGrantsToPermissions';
import { linodeGrantsToPermissions } from './linodeGrantsToPermissions';
import { nodeBalancerGrantsToPermissions } from './nodeBalancerGrantsToPermissions';
import { volumeGrantsToPermissions } from './volumeGrantsToPermissions';
import { vpcGrantsToPermissions } from './vpcGrantsToPermissions';

import type { EntityBase } from '../usePermissions';
import type {
  AccessType,
  Grants,
  GrantType,
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
      const vpcPermissionsMap = vpcGrantsToPermissions(
        entity?.permissions,
        profile?.restricted
      ) as PermissionMap;

      /** Add entity permissions to map */
      switch (grantType) {
        case 'firewall':
          entityPermissionsMap[entity.id] = firewallPermissionsMap;
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
  entityId?: number
): PermissionMap => {
  /** Find the entity in the grants */
  const firewall = grants?.firewall.find((f) => f.id === entityId);
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

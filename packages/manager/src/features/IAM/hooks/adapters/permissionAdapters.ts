import { accountGrantsToPermissions } from './accountGrantsToPermissions';
import { firewallGrantsToPermissions } from './firewallGrantsToPermissions';
import { linodeGrantsToPermissions } from './linodeGrantsToPermissions';

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
      switch (grantType) {
        case 'firewall':
          // eslint-disable-next-line no-case-declarations
          const firewallPermissionsMap = firewallGrantsToPermissions(
            entity?.permissions,
            profile?.restricted
          ) as PermissionMap;
          entityPermissionsMap[entity.id] = firewallPermissionsMap;
          break;
        case 'linode':
          // eslint-disable-next-line no-case-declarations
          const linodePermissionsMap = linodeGrantsToPermissions(
            entity?.permissions,
            profile?.restricted
          ) as PermissionMap;
          entityPermissionsMap[entity.id] = linodePermissionsMap;
          break;
      }
    });
  }
  return entityPermissionsMap;
};

/** Convert the existing Grant model to the new IAM RBAC model. */
export const fromGrants = (
  accessType: AccessType,
  permissionsToCheck: PermissionType[],
  grants?: Grants,
  isRestricted?: boolean,
  entityId?: number
): PermissionMap => {
  let usersPermissionsMap = {} as PermissionMap;

  switch (accessType) {
    case 'account':
      usersPermissionsMap = accountGrantsToPermissions(
        grants?.global,
        isRestricted
      ) as PermissionMap;
      break;
    case 'firewall':
      // eslint-disable-next-line no-case-declarations
      const firewall = grants?.firewall.find((f) => f.id === entityId);
      usersPermissionsMap = firewallGrantsToPermissions(
        firewall?.permissions,
        isRestricted
      ) as PermissionMap;
      break;
    case 'linode':
      // eslint-disable-next-line no-case-declarations
      const linode = grants?.linode.find((f) => f.id === entityId);
      usersPermissionsMap = linodeGrantsToPermissions(
        linode?.permissions,
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
  permissionsToCheck: PermissionType[],
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
  permissionsToCheck: PermissionType[],
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

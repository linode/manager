import { accountGrantsToPermissions } from './accountGrantsToPermissions';
import { firewallGrantsToPermissions } from './firewallGrantsToPermissions';
import { linodeGrantsToPermissions } from './linodeGrantsToPermissions';

import type { AccessType, Grants, PermissionType } from '@linode/api-v4';

export const toPermissionMap = (
  permissionsToCheck: PermissionType[],
  usersPermissions: PermissionType[],
  isRestricted?: boolean
): Record<PermissionType, boolean> => {
  const unrestricted = isRestricted === false; // explicit === false since the profile can be undefined
  const usersPermissionMap = {} as Record<PermissionType, boolean>;
  usersPermissions?.forEach(
    (permission) => (usersPermissionMap[permission] = true)
  );

  const permissionMap = {} as Record<PermissionType, boolean>;
  permissionsToCheck?.forEach(
    (permission) =>
      (permissionMap[permission] =
        (unrestricted || usersPermissionMap[permission]) ?? false)
  );

  return permissionMap;
};

/** Map the existing Grant model to the new IAM RBAC model. */
export const fromGrants = (
  accessType: AccessType,
  permissionsToCheck: PermissionType[],
  grants: Grants,
  isRestricted?: boolean,
  entittyId?: number
): Record<PermissionType, boolean> => {
  let usersPermissionsMap = {} as Record<PermissionType, boolean>;

  switch (accessType) {
    case 'account':
      usersPermissionsMap = accountGrantsToPermissions(
        grants?.global,
        isRestricted
      ) as Record<PermissionType, boolean>;
      break;
    case 'firewall':
      // eslint-disable-next-line no-case-declarations
      const firewall = grants?.firewall.find((f) => f.id === entittyId);
      usersPermissionsMap = firewallGrantsToPermissions(
        firewall?.permissions,
        isRestricted
      ) as Record<PermissionType, boolean>;
      break;
    case 'linode':
      // eslint-disable-next-line no-case-declarations
      const linode = grants?.linode.find((f) => f.id === entittyId);
      usersPermissionsMap = linodeGrantsToPermissions(
        linode?.permissions,
        isRestricted
      ) as Record<PermissionType, boolean>;
      break;
    default:
      throw new Error(`Unknown access type: ${accessType}`);
  }

  const permissionsMap = {} as Record<PermissionType, boolean>;
  permissionsToCheck?.forEach(
    (permission) =>
      (permissionsMap[permission] = usersPermissionsMap[permission] ?? false)
  );

  return permissionsMap;
};

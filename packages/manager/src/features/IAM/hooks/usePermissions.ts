import {
  useGrants,
  useUserAccountPermissions,
  useUserEntityPermissions,
} from '@linode/queries';

import { fromGrants, toPermissionMap } from './adapters/permissionAdapters';
import { useIsIAMEnabled } from './useIsIAMEnabled';

import type { AccessType, PermissionType } from '@linode/api-v4';

export const usePermissions = (
  accessType: AccessType,
  permissionsToCheck: PermissionType[],
  entityId?: number
): { permissions: Record<PermissionType, boolean> } => {
  const { isIAMEnabled } = useIsIAMEnabled();

  const { data: userAccountPermissions } = useUserAccountPermissions(
    accessType === 'account'
  );

  const { data: userEntityPermisssions } = useUserEntityPermissions(
    accessType,
    entityId!
  );

  const usersPermissions =
    accessType === 'account' ? userAccountPermissions : userEntityPermisssions;

  const { data: grants } = useGrants(!isIAMEnabled);

  const permissionMap = isIAMEnabled
    ? toPermissionMap(permissionsToCheck, usersPermissions!)
    : fromGrants(accessType, permissionsToCheck, grants!, entityId);

  return { permissions: permissionMap } as const;
};

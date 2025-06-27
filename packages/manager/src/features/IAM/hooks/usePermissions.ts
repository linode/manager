import {
  useGrants,
  useProfile,
  useUserAccountPermissions,
  useUserEntityPermissions,
} from '@linode/queries';

import { fromGrants, toPermissionMap } from './adapters/permissionAdapters';
import { useIsIAMEnabled } from './useIsIAMEnabled';

import type { AccessType, PermissionType } from '@linode/api-v4';

export const usePermissions = (
  accessType: AccessType,
  permissionsToCheck: PermissionType[],
  entityId?: number,
  enabled: boolean = true
): { permissions: Record<PermissionType, boolean> } => {
  const { isIAMEnabled } = useIsIAMEnabled();

  const { data: userAccountPermissions } = useUserAccountPermissions(
    isIAMEnabled && accessType === 'account' && enabled
  );

  const { data: userEntityPermisssions } = useUserEntityPermissions(
    accessType,
    entityId!,
    isIAMEnabled && enabled
  );

  const usersPermissions =
    accessType === 'account' ? userAccountPermissions : userEntityPermisssions;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants(!isIAMEnabled && enabled);

  const permissionMap = isIAMEnabled
    ? toPermissionMap(permissionsToCheck, usersPermissions!)
    : fromGrants(accessType, permissionsToCheck, grants!, profile, entityId);

  return { permissions: permissionMap } as const;
};

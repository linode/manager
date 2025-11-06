import {
  getAccountRoles,
  getAvailableEntitiesFromPermission,
  getUserAccountPermissions,
  getUserEntityPermissions,
  getUserRoles,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import type { AccessType, PermissionType } from '@linode/api-v4';

export const iamQueries = createQueryKeys('iam', {
  user: (username: string) => ({
    contextQueries: {
      roles: {
        queryFn: () => getUserRoles(username),
        queryKey: null,
      },
      accountPermissions: {
        queryFn: () => getUserAccountPermissions(username),
        queryKey: [username],
      },
      entityPermissions: (
        entityType: AccessType,
        entityId: number | string,
      ) => ({
        queryFn: () => getUserEntityPermissions(username, entityType, entityId),
        queryKey: [entityType, entityId],
      }),
      availableEntitiesFromPermission: (
        entityType: AccessType,
        permission: PermissionType,
      ) => ({
        queryFn: () =>
          getAvailableEntitiesFromPermission({
            username,
            entityType,
            permission,
          }),
        queryKey: [entityType, permission],
      }),
    },
    queryKey: [username],
  }),
  accountRoles: {
    queryFn: getAccountRoles,
    queryKey: null,
  },
});

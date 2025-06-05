import {
  getAccountRoles,
  getUserAccountPermissions,
  getUserEntityPermissions,
  getUserRoles,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import type { EntityTypePermissions } from '@linode/api-v4';

export const iamQueries = createQueryKeys('iam', {
  user: (username: string) => ({
    contextQueries: {
      permissions: {
        queryFn: () => getUserRoles(username),
        queryKey: null,
      },
      accountPermissions: {
        queryFn: () => getUserAccountPermissions(username),
        queryKey: null,
      },
      entityPermissions: (
        entityType: EntityTypePermissions,
        entityId: number
      ) => ({
        queryFn: () => getUserEntityPermissions(username, entityType, entityId),
        queryKey: [entityType, entityId],
      }),
    },
    queryKey: [username],
  }),
  permissions: {
    queryFn: getAccountRoles,
    queryKey: null,
  },
});

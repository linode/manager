import {
  getAccountRoles,
  getUserAccountPermissions,
  getUserEntities,
  getUserEntitiesByPermission,
  getUserEntityPermissions,
  getUserRoles,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';
import { createQueryKeys } from '@lukemorales/query-key-factory';

import type {
  AccessType,
  EntityByPermission,
  GetEntitiesByPermissionParams,
  Params,
  PermissionType,
} from '@linode/api-v4';

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
      getPaginatedEntitiesByPermission: (
        entityType: AccessType,
        permission: PermissionType,
      ) => ({
        queryFn: () =>
          getUserEntitiesByPermission({
            username,
            entityType,
            permission,
          }).then((res) => res.data ?? []),
        queryKey: [entityType, permission],
      }),
      getAllEntitiesByPermission: (
        entityType: AccessType,
        permission: PermissionType,
      ) => ({
        queryFn: () =>
          getAllUserEntitiesByPermission({
            username,
            entityType,
            permission,
          }).then((res) => res.data ?? []),
        queryKey: [entityType, permission],
      }),
      userEntities: (entityType: AccessType, params: Params = {}) => ({
        queryFn: () =>
          getUserEntities({ username, entityType, params }).then(
            (res) => res.data,
          ),
        queryKey: [entityType, params],
      }),
      allUserEntities: (entityType: AccessType) => ({
        queryFn: () =>
          getAll<EntityByPermission>((params) =>
            getUserEntities({ username, entityType, params }),
          )().then((data) => data.data),
        queryKey: [entityType, 'all'],
      }),
    },
    queryKey: [username],
  }),
  accountRoles: {
    queryFn: getAccountRoles,
    queryKey: null,
  },
});

export const getAllUserEntitiesByPermission = ({
  username,
  entityType,
  permission,
}: GetEntitiesByPermissionParams) =>
  getAll<EntityByPermission>((params, filter) =>
    getUserEntitiesByPermission({
      username,
      entityType,
      permission,
      params,
      filter,
    }),
  )();

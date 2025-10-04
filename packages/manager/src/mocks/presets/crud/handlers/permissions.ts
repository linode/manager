import { http } from 'msw';

import { accountRolesFactory } from 'src/factories/accountRoles';
import { mswDB } from 'src/mocks/indexedDB';
import {
  makeNotFoundResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type {
  AccessType,
  AccountRoleType,
  EntityRoleType,
  IamAccountRoles,
  IamUserRoles,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type {
  MockState,
  UserAccountPermissionsEntry,
  UserEntityPermissionsEntry,
} from 'src/mocks/types';
import type { APIErrorResponse } from 'src/mocks/utilities/response';

export const getPermissions = (mockState: MockState) => [
  // Get user roles for a specific username
  http.get(
    '*/v4*/iam/users/:username/role-permissions',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | IamUserRoles>> => {
      const username = params.username;

      // Get account permissions
      const userAccountPermissionsEntries = await mswDB.getAll(
        'userAccountPermissions'
      );
      const accountPermissionsEntry = userAccountPermissionsEntries?.find(
        (entry: UserAccountPermissionsEntry) => entry.username === username
      );

      // Get entity permissions
      const userEntityPermissionsEntries = await mswDB.getAll(
        'userEntityPermissions'
      );
      const entityPermissionsEntries = userEntityPermissionsEntries?.filter(
        (entry: UserEntityPermissionsEntry) => entry.username === username
      );

      // Construct the response from current data
      const response: IamUserRoles = {
        account_access: accountPermissionsEntry?.permissions || [],
        entity_access:
          entityPermissionsEntries?.map((entry) => ({
            id: Number(entry.entityId),
            roles: entry.permissions,
            type: entry.entityType as AccessType,
          })) || [],
      };

      return makeResponse(response);
    }
  ),

  // Update user roles for a specific username
  // Update user roles for a specific username
  http.put(
    '*/v4*/iam/users/:username/role-permissions',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | IamUserRoles>> => {
      const username = params.username as string;
      const body = (await request.json()) as IamUserRoles;

      const currentState = await mswDB.getStore('mockState');

      if (!currentState) {
        return makeNotFoundResponse();
      }

      const updatedState = {
        ...currentState,
        userRoles: [
          ...currentState.userRoles.filter(
            (entry) => entry.username !== username
          ),
          { username, roles: body },
        ],
        userAccountPermissions: body.account_access
          ? [
              ...currentState.userAccountPermissions.filter(
                (entry) => entry.username !== username
              ),
              { username, permissions: body.account_access },
            ]
          : currentState.userAccountPermissions,
        userEntityPermissions: body.entity_access
          ? [
              ...currentState.userEntityPermissions.filter(
                (entry) => entry.username !== username
              ),
              ...body.entity_access.map((entityAccess) => ({
                username,
                entityType: entityAccess.type,
                entityId: entityAccess.id,
                permissions: entityAccess.roles,
              })),
            ]
          : currentState.userEntityPermissions,
      };

      await mswDB.saveStore(updatedState, 'mockState');

      return makeResponse(body);
    }
  ),

  // Get account roles (all available roles)
  http.get(
    '*/v4*/iam/role-permissions',
    async (): Promise<StrictResponse<APIErrorResponse | IamAccountRoles>> => {
      return makeResponse(accountRolesFactory.build());
    }
  ),

  // Update account roles
  http.put(
    '*/v4*/iam/role-permissions',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | IamAccountRoles>> => {
      const body = (await request.json()) as IamAccountRoles;

      if (mockState) {
        const updatedMockState = {
          ...mockState,
          accountRoles: [body],
        };
        await mswDB.saveStore(updatedMockState, 'mockState');
      }

      return makeResponse(body);
    }
  ),

  // Get user account permissions
  http.get(
    '*/v4*/iam/users/:username/permissions/account',
    async ({
      params,
    }): Promise<StrictResponse<AccountRoleType[] | APIErrorResponse>> => {
      const username = params.username;

      const userAccountPermissionsEntries = await mswDB.getAll(
        'userAccountPermissions'
      );

      if (
        !userAccountPermissionsEntries ||
        userAccountPermissionsEntries.length === 0
      ) {
        return makeNotFoundResponse();
      }

      const permissionsEntry = userAccountPermissionsEntries.find(
        (entry: UserAccountPermissionsEntry) => entry.username === username
      );

      if (!permissionsEntry) {
        return makeNotFoundResponse();
      }

      return makeResponse(permissionsEntry.permissions);
    }
  ),

  // Update user account permissions
  http.put(
    '*/v4*/iam/users/:username/permissions/account',
    async ({
      params,
      request,
    }): Promise<StrictResponse<AccountRoleType[] | APIErrorResponse>> => {
      const username = params.username as string;
      const body = (await request.json()) as AccountRoleType[];

      const userAccountPermissionsEntries = await mswDB.getAll(
        'userAccountPermissions'
      );
      const existingIndex = userAccountPermissionsEntries?.findIndex(
        (entry: UserAccountPermissionsEntry) => entry.username === username
      );

      const permissionsEntry: UserAccountPermissionsEntry = {
        username,
        permissions: body,
      };

      if (!userAccountPermissionsEntries || !existingIndex) {
        return makeNotFoundResponse();
      }

      if (existingIndex !== -1) {
        userAccountPermissionsEntries[existingIndex] = permissionsEntry;
      } else {
        userAccountPermissionsEntries.push(permissionsEntry);
      }

      if (mockState) {
        const updatedMockState = {
          ...mockState,
          userAccountPermissions: userAccountPermissionsEntries,
        };
        await mswDB.saveStore(updatedMockState, 'mockState');
      }

      return makeResponse(body);
    }
  ),

  // Get user entity permissions
  http.get(
    '*/v4*/iam/users/:username/permissions/:entityType/:entityId',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | EntityRoleType[]>> => {
      const username = params.username as string;
      const entityType = params.entityType;
      const entityId = params.entityId;

      const userEntityPermissionsEntries = await mswDB.getAll(
        'userEntityPermissions'
      );

      if (
        !userEntityPermissionsEntries ||
        userEntityPermissionsEntries.length === 0
      ) {
        return makeNotFoundResponse();
      }

      const permissionsEntry = userEntityPermissionsEntries.find(
        (entry: UserEntityPermissionsEntry) =>
          entry.username === username &&
          entry.entityType === entityType &&
          entry.entityId === entityId
      );

      if (!permissionsEntry) {
        return makeNotFoundResponse();
      }

      return makeResponse(permissionsEntry.permissions);
    }
  ),

  // Update user entity permissions
  http.put(
    '*/v4*/iam/users/:username/permissions/:entityType/:entityId',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | EntityRoleType[]>> => {
      const username = params.username as string;
      const entityType = params.entityType as string;
      const entityId = params.entityId as number | string;
      const body = (await request.json()) as EntityRoleType[];

      const userEntityPermissionsEntries = await mswDB.getAll(
        'userEntityPermissions'
      );
      const existingIndex = userEntityPermissionsEntries?.findIndex(
        (entry: UserEntityPermissionsEntry) =>
          entry.username === username &&
          entry.entityType === entityType &&
          entry.entityId === entityId
      );

      const permissionsEntry: UserEntityPermissionsEntry = {
        username,
        entityType,
        entityId,
        permissions: body,
      };

      if (!userEntityPermissionsEntries || !existingIndex) {
        return makeNotFoundResponse();
      }

      if (existingIndex !== -1) {
        userEntityPermissionsEntries[existingIndex] = permissionsEntry;
      } else {
        userEntityPermissionsEntries.push(permissionsEntry);
      }

      if (mockState) {
        const updatedMockState = {
          ...mockState,
          userEntityPermissions: userEntityPermissionsEntries,
        };
        await mswDB.saveStore(updatedMockState, 'mockState');
      }

      return makeResponse(body);
    }
  ),
];

import { http } from 'msw';

import { mswDB } from 'src/mocks/indexedDB';
import {
  makeNotFoundResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type {
  IamAccountRoles,
  IamUserRoles,
  PermissionType,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type {
  MockState,
  UserAccountPermissionsEntry,
  UserEntityPermissionsEntry,
  UserRolesEntry,
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

      const userRolesEntries = await mswDB.getAll('userRoles');

      if (!userRolesEntries || userRolesEntries.length === 0) {
        return makeNotFoundResponse();
      }

      const userRolesEntry = userRolesEntries.find(
        (entry: UserRolesEntry) => entry.username === username
      );

      if (!userRolesEntry) {
        return makeNotFoundResponse();
      }

      return makeResponse(userRolesEntry.roles);
    }
  ),

  // Update user roles for a specific username
  http.put(
    '*/v4*/iam/users/:username/role-permissions',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | IamUserRoles>> => {
      const username = params.username as string;
      const body = (await request.json()) as IamUserRoles;

      const userRolesEntries = await mswDB.getAll('userRoles');
      const existingIndex = userRolesEntries?.findIndex(
        (entry: UserRolesEntry) => entry.username === username
      );

      const userRolesEntry: UserRolesEntry = {
        username,
        roles: body,
      };

      if (!userRolesEntries || !existingIndex) {
        return makeNotFoundResponse();
      }

      if (existingIndex !== -1) {
        userRolesEntries[existingIndex] = userRolesEntry;
      } else {
        userRolesEntries.push(userRolesEntry);
      }

      const mockState = await mswDB.getStore('seedState');
      if (mockState) {
        const updatedMockState = {
          ...mockState,
          userRoles: userRolesEntries,
        };
        await mswDB.saveStore(updatedMockState, 'seedState');
      }

      return makeResponse(body);
    }
  ),

  // Get account roles (all available roles)
  http.get(
    '*/v4*/iam/role-permissions',
    async (): Promise<StrictResponse<APIErrorResponse | IamAccountRoles>> => {
      const accountRoles = await mswDB.getAll('accountRoles');

      if (!accountRoles || accountRoles.length === 0) {
        return makeNotFoundResponse();
      }

      return makeResponse(accountRoles[0]);
    }
  ),

  // Update account roles
  http.put(
    '*/v4*/iam/role-permissions',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | IamAccountRoles>> => {
      const body = (await request.json()) as IamAccountRoles;

      const mockState = await mswDB.getStore('seedState');
      if (mockState) {
        const updatedMockState = {
          ...mockState,
          accountRoles: [body],
        };
        await mswDB.saveStore(updatedMockState, 'seedState');
      }

      return makeResponse(body);
    }
  ),

  // Get user account permissions
  http.get(
    '*/v4*/iam/users/:username/permissions/account',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | PermissionType[]>> => {
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
    }): Promise<StrictResponse<APIErrorResponse | PermissionType[]>> => {
      const username = params.username as string;
      const body = (await request.json()) as PermissionType[];

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

      const mockState = await mswDB.getStore('seedState');
      if (mockState) {
        const updatedMockState = {
          ...mockState,
          userAccountPermissions: userAccountPermissionsEntries,
        };
        await mswDB.saveStore(updatedMockState, 'seedState');
      }

      return makeResponse(body);
    }
  ),

  // Get user entity permissions
  http.get(
    '*/v4*/iam/users/:username/permissions/:entityType/:entityId',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | PermissionType[]>> => {
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
    }): Promise<StrictResponse<APIErrorResponse | PermissionType[]>> => {
      const username = params.username as string;
      const entityType = params.entityType as string;
      const entityId = params.entityId as number | string;
      const body = (await request.json()) as PermissionType[];

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

      const mockState = await mswDB.getStore('seedState');
      if (mockState) {
        const updatedMockState = {
          ...mockState,
          userEntityPermissions: userEntityPermissionsEntries,
        };
        await mswDB.saveStore(updatedMockState, 'seedState');
      }

      return makeResponse(body);
    }
  ),
];

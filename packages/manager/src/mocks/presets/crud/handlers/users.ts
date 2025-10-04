import { http } from 'msw';

import { accountUserFactory } from 'src/factories';
import { userDefaultRolesFactory } from 'src/factories/userRoles';
import { mswDB } from 'src/mocks/indexedDB';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { User } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getUsers = () => [
  http.get(
    '*/v4*/account/users',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<User>>
    > => {
      const users = await mswDB.getAll('users');

      if (!users) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: users,
        request,
      });
    }
  ),

  http.get(
    '*/v4*/account/users/:username',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | User>> => {
      const username = params.username as string;
      const users = await mswDB.getAll('users');

      const user = users?.find((user) => user.username === username);

      if (!user) {
        return makeNotFoundResponse();
      }

      return makeResponse(user);
    }
  ),
];

export const createUser = (mockState: MockState) => [
  http.post(
    '*/v4*/account/users',
    async ({ request }): Promise<StrictResponse<APIErrorResponse | User>> => {
      const body = (await request.json()) as User;

      const user = accountUserFactory.build({ ...body });
      const defaultRoles = userDefaultRolesFactory.build();

      // Add user to users array
      await mswDB.add('users', user, mockState);

      // Add userRoles entry
      await mswDB.add(
        'userRoles',
        { username: user.username, roles: defaultRoles },
        mockState
      );

      // Add userAccountPermissions entry
      if (defaultRoles.account_access) {
        await mswDB.add(
          'userAccountPermissions',
          { username: user.username, permissions: defaultRoles.account_access },
          mockState
        );
      }

      // Add userEntityPermissions entries
      if (defaultRoles.entity_access) {
        for (const entityAccess of defaultRoles.entity_access) {
          await mswDB.add(
            'userEntityPermissions',
            {
              username: user.username,
              entityType: entityAccess.type,
              entityId: entityAccess.id,
              permissions: entityAccess.roles,
            },
            mockState
          );
        }
      }

      return makeResponse(user);
    }
  ),
];

export const updateUser = (mockState: MockState) => [
  http.put(
    '*/v4*/account/users/:username',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | User>> => {
      const username = params.username as string;
      const body = (await request.json()) as User;
      const users = await mswDB.getAll('users');
      const user = users?.find((user) => user.username === username);

      if (!user) {
        return makeNotFoundResponse();
      }

      const payload = accountUserFactory.build({ ...user, ...body });

      await mswDB.update('users', username, payload, mockState);

      return makeResponse(payload);
    }
  ),
];

export const deleteUser = (mockState: MockState) => [
  http.delete(
    '*/v4*/account/users/:username',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const username = params.username as string;

      const users = await mswDB.getAll('users');

      const user = users?.find((user) => user.username === username);

      // Also delete roles and permissions
      await mswDB.delete('userRoles', username, mockState);
      await mswDB.delete('userAccountPermissions', username, mockState);
      await mswDB.delete('userEntityPermissions', username, mockState);

      if (!user) {
        return makeNotFoundResponse();
      }

      await mswDB.delete('users', username, mockState);

      return makeResponse({});
    }
  ),
];

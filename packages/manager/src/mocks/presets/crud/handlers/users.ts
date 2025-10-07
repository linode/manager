import { getProfile } from '@linode/api-v4';
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

const addUserToMockState = async (mockState: MockState, user: User) => {
  await mswDB.add('users', user, mockState);

  const defaultRoles = userDefaultRolesFactory.build();

  await mswDB.add(
    'userRoles',
    { username: user.username, roles: defaultRoles },
    mockState
  );

  if (defaultRoles.account_access) {
    await mswDB.add(
      'userAccountPermissions',
      { username: user.username, permissions: defaultRoles.account_access },
      mockState
    );
  }

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

  await mswDB.saveStore(mockState, 'mockState');
};

export const getUsers = (mockState: MockState) => [
  http.get(
    '*/v4*/account/users',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<User>>
    > => {
      const profile = await getProfile();
      const userTypeFromProfile = profile?.user_type;
      const actingUser = accountUserFactory.build({
        username: profile?.username,
        user_type: profile?.user_type,
      });
      const users = await mswDB.getAll('users');

      if (!users) {
        return makeNotFoundResponse();
      }

      if (!users.find((user) => user.username === actingUser.username)) {
        addUserToMockState(mockState, actingUser);
      }

      // Not in parent/child context, just return defaults users (including the real acting user)
      if (userTypeFromProfile === 'default') {
        return makePaginatedResponse({
          data: users.filter((user) => user.user_type === 'default'),
          request,
        });
      }

      // In parent/child context, return only parent users (including the real acting user)
      if (userTypeFromProfile === 'parent') {
        return makePaginatedResponse({
          data: users.filter((user) => user.user_type === 'parent'),
          request,
        });
      }

      if (userTypeFromProfile === 'child') {
        return makePaginatedResponse({
          data: users.filter(
            (user) =>
              user.user_type === 'child' ||
              user.user_type === 'delegate' ||
              user.user_type === 'proxy'
          ),
          request,
        });
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
      const profile = await getProfile();
      const userTypeFromProfile = profile?.user_type;
      const body = (await request.json()) as User;

      const user = accountUserFactory.build({
        ...body,
        user_type: userTypeFromProfile,
      });

      // Add user to users array
      await addUserToMockState(mockState, user);

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

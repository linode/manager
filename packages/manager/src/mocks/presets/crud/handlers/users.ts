import { getProfile } from '@linode/api-v4';
import { childAccountFactory } from '@linode/utilities';
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

/**
 * Reusable methods to create and remove users because of the complex logic and relationship model
 */
export const addUserToMockState = async (mockState: MockState, user: User) => {
  await mswDB.add('users', user, mockState);

  const defaultRoles = userDefaultRolesFactory.build();

  // Add user roles
  await mswDB.add(
    'userRoles',
    { username: user.username, roles: defaultRoles },
    mockState
  );

  // Add user account permissions
  if (defaultRoles.account_access) {
    await mswDB.add(
      'userAccountPermissions',
      { username: user.username, permissions: defaultRoles.account_access },
      mockState
    );
  }

  // Add user entity permissions
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

  if (user.user_type === 'parent') {
    const childAccounts = childAccountFactory.buildList(4);

    // Create delegations pointing to our active user (parent)
    for (const childAccount of childAccounts) {
      await mswDB.add('childAccounts', childAccount, mockState);
      await mswDB.add(
        'delegations',
        {
          username: user.username,
          childAccountEuuid: childAccount.euuid,
          id: Math.floor(Math.random() * 1000000),
        },
        mockState
      );
    }
  }

  await mswDB.saveStore(mockState, 'mockState');
};

export const removeUserFromMockState = async (
  mockState: MockState,
  user: User
) => {
  await mswDB.delete('users', user.username, mockState);
  await mswDB.delete('userRoles', user.username, mockState);
  await mswDB.delete('userAccountPermissions', user.username, mockState);
  await mswDB.delete('userEntityPermissions', user.username, mockState);

  // If parent user, delete all their delegations
  if (user.user_type === 'parent') {
    const delegations = await mswDB.getAll('delegations');
    const userDelegations = delegations?.filter(
      (d) => d.username === user.username
    );

    if (userDelegations) {
      for (const delegation of userDelegations) {
        await mswDB.delete('delegations', delegation.id, mockState);
      }
    }
  }
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
        restricted: profile?.restricted,
      });
      let users = await mswDB.getAll('users');

      if (!users) {
        return makeNotFoundResponse();
      }

      if (!users.find((user) => user.username === actingUser.username)) {
        await addUserToMockState(mockState, actingUser);
        // Re-fetch users to include the newly added user
        users = await mswDB.getAll('users');

        if (!users) {
          return makeNotFoundResponse();
        }
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

      if (!user) {
        return makeNotFoundResponse();
      }

      removeUserFromMockState(mockState, user);

      return makeResponse({});
    }
  ),
];

import { getSeedsCountMap } from 'src/dev-tools/utils';
import { accountUserFactory } from 'src/factories';
import { accountRolesFactory } from 'src/factories/accountRoles';
import { userDefaultRolesFactory } from 'src/factories/userRoles';
import { mswDB } from 'src/mocks/indexedDB';

import type {
  UserAccountPermissionsEntry,
  UserEntityPermissionsEntry,
  UserRolesEntry,
} from 'src/mocks/types';
import type { MockSeeder, MockState } from 'src/mocks/types';

export const usersSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Users Seeds with Permissions',
  group: { id: 'Users' },
  id: 'users:crud',
  label: 'Users',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[usersSeeder.id] ?? 0;

    // Create users
    const users = accountUserFactory.buildList(count);

    // Create permissions for each user
    const userRolesEntries: UserRolesEntry[] = [];
    const userAccountPermissionsEntries: UserAccountPermissionsEntry[] = [];
    const userEntityPermissionsEntries: UserEntityPermissionsEntry[] = [];

    users.forEach((user) => {
      // Create user roles
      const userRoles = userDefaultRolesFactory.build();
      userRolesEntries.push({
        username: user.username,
        roles: userRoles,
      });

      // Create user account permissions
      userAccountPermissionsEntries.push({
        username: user.username,
        permissions: [],
      });
    });

    // Create account roles (only once, not per user)
    const accountRoles = [accountRolesFactory.build()];

    const updatedMockState = {
      ...mockState,
      users: mockState.users.concat(users),
      userRoles: (mockState.userRoles ?? []).concat(userRolesEntries),
      userAccountPermissions: (mockState.userAccountPermissions ?? []).concat(
        userAccountPermissionsEntries
      ),
      userEntityPermissions: userEntityPermissionsEntries,
      accountRoles,
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

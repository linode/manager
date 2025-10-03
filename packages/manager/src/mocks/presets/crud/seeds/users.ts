import { getSeedsCountMap } from 'src/dev-tools/utils';
import { accountUserFactory } from 'src/factories';
import { accountRolesFactory } from 'src/factories/accountRoles';
import { userAccountPermissionsFactory } from 'src/factories/userAccountPermissions';
import { userEntityPermissionsFactory } from 'src/factories/userEntityPermissions';
import { userRolesFactory } from 'src/factories/userRoles';
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
      const userRoles = userRolesFactory.build();
      userRolesEntries.push({
        username: user.username,
        roles: userRoles,
      });

      // Create user account permissions
      userAccountPermissionsEntries.push({
        username: user.username,
        permissions: userAccountPermissionsFactory,
      });

      // Create user entity permissions for some entities (if they exist)
      if (mockState.linodes && mockState.linodes.length > 0) {
        // Give this user permissions to the first few linodes
        const userIndex = users.indexOf(user);
        const linodeIndex = userIndex % mockState.linodes.length;
        const linode = mockState.linodes[linodeIndex];

        userEntityPermissionsEntries.push({
          username: user.username,
          entityType: 'linode',
          entityId: linode.id,
          permissions: userEntityPermissionsFactory,
        });
      }

      // You can add more entity permissions here (firewalls, volumes, etc.)
      if (mockState.firewalls && mockState.firewalls.length > 0) {
        const userIndex = users.indexOf(user);
        const firewallIndex = userIndex % mockState.firewalls.length;
        const firewall = mockState.firewalls[firewallIndex];

        userEntityPermissionsEntries.push({
          username: user.username,
          entityType: 'firewall',
          entityId: firewall.id,
          permissions: userEntityPermissionsFactory,
        });
      }
    });

    // Create account roles (only once, not per user)
    const accountRoles = [accountRolesFactory.build()];

    const updatedMockState = {
      ...mockState,
      // Add users
      users: mockState.users.concat(users),
      // Add permissions for users
      userRoles: (mockState.userRoles ?? []).concat(userRolesEntries),
      userAccountPermissions: (mockState.userAccountPermissions ?? []).concat(
        userAccountPermissionsEntries
      ),
      userEntityPermissions: (mockState.userEntityPermissions ?? []).concat(
        userEntityPermissionsEntries
      ),
      // Add account roles (only if not already present)
      accountRoles:
        mockState.accountRoles.length > 0
          ? mockState.accountRoles
          : mockState.accountRoles.concat(accountRoles),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

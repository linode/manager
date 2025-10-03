import { getSeedsCountMap } from 'src/dev-tools/utils';
import { accountRolesFactory } from 'src/factories/accountRoles';
import { userAccountPermissionsFactory } from 'src/factories/userAccountPermissions';
import { userEntityPermissionsFactory } from 'src/factories/userEntityPermissions';
import { userRolesFactory } from 'src/factories/userRoles';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockSeeder, MockState } from 'src/mocks/types';
import type {
  UserAccountPermissionsEntry,
  UserEntityPermissionsEntry,
  UserRolesEntry,
} from 'src/mocks/types';

export const permissionsSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Permissions Seeds',
  group: { id: 'Permissions' },
  id: 'permissions:crud',
  label: 'Permissions',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[permissionsSeeder.id] ?? 3;

    const existingUsers = mockState.users || [];

    const userRolesEntries: UserRolesEntry[] = [];
    const userAccountPermissionsEntries: UserAccountPermissionsEntry[] = [];
    const userEntityPermissionsEntries: UserEntityPermissionsEntry[] = [];

    for (let i = 0; i < Math.min(count, existingUsers.length); i++) {
      const user = existingUsers[i];

      const userRoles = userRolesFactory.build();
      userRolesEntries.push({
        username: user.username,
        roles: userRoles,
      });

      userAccountPermissionsEntries.push({
        username: user.username,
        permissions: userAccountPermissionsFactory,
      });

      if (mockState.linodes && mockState.linodes.length > 0) {
        const linode = mockState.linodes[i % mockState.linodes.length];
        userEntityPermissionsEntries.push({
          username: user.username,
          entityType: 'linode',
          entityId: linode.id,
          permissions: userEntityPermissionsFactory,
        });
      }
    }

    const accountRoles = [accountRolesFactory.build()];

    const updatedMockState = {
      ...mockState,
      userRoles: (mockState.userRoles ?? []).concat(userRolesEntries),
      accountRoles: (mockState.accountRoles ?? []).concat(accountRoles),
      userAccountPermissions: (mockState.userAccountPermissions ?? []).concat(
        userAccountPermissionsEntries
      ),
      userEntityPermissions: (mockState.userEntityPermissions ?? []).concat(
        userEntityPermissionsEntries
      ),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

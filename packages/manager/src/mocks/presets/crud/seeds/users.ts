import { getProfile } from '@linode/api-v4';
import { childAccountFactory } from '@linode/utilities';

import { getSeedsCountMap } from 'src/dev-tools/utils';
import { accountUserFactory } from 'src/factories';
import { userDefaultRolesFactory } from 'src/factories/userRoles';
import { mswDB } from 'src/mocks/indexedDB';
import { seedWithUniqueIds } from 'src/mocks/presets/crud/seeds/utils';

import type { ChildAccount } from '@linode/api-v4';
import type {
  Delegation,
  MockSeeder,
  MockState,
  UserAccountPermissionsEntry,
  UserEntityPermissionsEntry,
  UserRolesEntry,
} from 'src/mocks/types';

export const usersSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Users Seeds with Permissions',
  group: { id: 'Users' },
  id: 'users:crud',
  label: 'Users',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[usersSeeder.id] ?? 0;
    const profile = await getProfile();

    const userSeeds = seedWithUniqueIds<'users'>({
      dbEntities: await mswDB.getAll('users'),
      seedEntities: accountUserFactory.buildList(count, {
        user_type: profile?.user_type,
        restricted: profile?.restricted,
      }),
    });

    const userRolesEntries: UserRolesEntry[] = [];
    const userAccountPermissionsEntries: UserAccountPermissionsEntry[] = [];
    const userEntityPermissionsEntries: UserEntityPermissionsEntry[] = [];
    const childAccountsToAdd: ChildAccount[] = [];
    const delegationsToAdd: Delegation[] = [];

    userSeeds.forEach((user) => {
      const userRoles = userDefaultRolesFactory.build();
      userRolesEntries.push({
        username: user.username,
        roles: userRoles,
      });

      if (userRoles.account_access) {
        userAccountPermissionsEntries.push({
          username: user.username,
          permissions: userRoles.account_access,
        });
      }

      if (userRoles.entity_access) {
        for (const entityAccess of userRoles.entity_access) {
          userEntityPermissionsEntries.push({
            username: user.username,
            entityType: entityAccess.type,
            entityId: entityAccess.id,
            permissions: entityAccess.roles,
          });
        }
      }

      // Create child accounts and delegations for parent users
      if (user.user_type === 'parent') {
        const delegateUser = accountUserFactory.build({
          username: `${user.username}_delegate`,
          user_type: 'delegate',
          email: `${user.username}_delegate@example.com`,
          restricted: false,
        });
        userSeeds.push(delegateUser);

        const childAccounts = childAccountFactory.buildList(3);

        for (const childAccount of childAccounts) {
          childAccountsToAdd.push(childAccount);
          delegationsToAdd.push({
            username: user.username,
            childAccountEuuid: childAccount.euuid,
            id: Math.floor(Math.random() * 1000000),
          });
        }
      }
    });

    const updatedMockState = {
      ...mockState,
      users: (mockState.users ?? []).concat(userSeeds),
      userRoles: (mockState.userRoles ?? []).concat(userRolesEntries),
      userAccountPermissions: (mockState.userAccountPermissions ?? []).concat(
        userAccountPermissionsEntries
      ),
      userEntityPermissions: (mockState.userEntityPermissions ?? []).concat(
        userEntityPermissionsEntries
      ),
      childAccounts: (mockState.childAccounts ?? []).concat(childAccountsToAdd),
      delegations: (mockState.delegations ?? []).concat(delegationsToAdd),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

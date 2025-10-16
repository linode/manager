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

export const defaultUsersSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Users Seeds with Permissions',
  group: { id: 'Users' },
  id: 'users(default):crud',
  label: 'Default Users',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[defaultUsersSeeder.id] ?? 0;

    const userSeeds = seedWithUniqueIds<'users'>({
      dbEntities: await mswDB.getAll('users'),
      seedEntities: accountUserFactory.buildList(count, {
        user_type: 'default',
        restricted: true,
      }),
    });

    const userRolesEntries: UserRolesEntry[] = [];
    const userAccountPermissionsEntries: UserAccountPermissionsEntry[] = [];
    const userEntityPermissionsEntries: UserEntityPermissionsEntry[] = [];

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
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

/**
 * This way, when you seed 10 parent users, you'll get:
 * 10 parent users
 * 30 child accounts (3 per parent)
 * 60 child users (2 per child account)
 * 10 delegate users (1 per parent)
 * All the proper relationships and permissions
 */
export const parentUsersSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Parent Users (with child accounts and delegations)',
  group: { id: 'Users' },
  id: 'users(parent):crud',
  label: 'Parent Users (with child accounts and delegations)',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[parentUsersSeeder.id] ?? 0;

    const existingUsers = await mswDB.getAll('users');
    const existingUsernames = existingUsers?.map((u) => u.username) || [];

    // Only create users that don't already exist
    const newUsers = accountUserFactory
      .buildList(count, {
        user_type: 'parent',
        restricted: false,
      })
      .filter((user) => !existingUsernames.includes(user.username));

    const userSeeds = seedWithUniqueIds<'users'>({
      dbEntities: existingUsers,
      seedEntities: newUsers,
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
      const childAccounts = childAccountFactory.buildList(3);
      for (const childAccount of childAccounts) {
        childAccountsToAdd.push(childAccount);
        delegationsToAdd.push({
          username: user.username,
          childAccountEuuid: childAccount.euuid,
          id: Math.floor(Math.random() * 1000000),
        });

        // Create child users for each child account
        const childUsers = accountUserFactory
          .buildList(2, {
            user_type: 'child',
            restricted: true,
          })
          .map((user, index) => ({
            ...user,
            username: `child-user-${childAccount.euuid}-${index}`,
            email: `child-user-${childAccount.euuid}-${index}@example.com`,
          }));

        for (const childUser of childUsers) {
          userSeeds.push(childUser);

          // Add roles for child users
          const childUserRoles = userDefaultRolesFactory.build();
          userRolesEntries.push({
            username: childUser.username,
            roles: childUserRoles,
          });

          // Add permissions if needed
          if (childUserRoles.account_access) {
            userAccountPermissionsEntries.push({
              username: childUser.username,
              permissions: childUserRoles.account_access,
            });
          }
        }
      }

      // Create delegate users for each parent user
      const delegateUsers = accountUserFactory.build({
        user_type: 'delegate',
        username: `delegateuser-${user.username}-${Math.floor(Math.random() * 100000)}-${Math.floor(Math.random() * 1000000)}`,
        email: `${user.username}_delegate@example.com`,
        restricted: false,
      });

      userSeeds.push(delegateUsers);
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

import { childAccountFactory, pickRandomMultiple } from '@linode/utilities';

import { getSeedsCountMap } from 'src/dev-tools/utils';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockSeeder, MockState } from 'src/mocks/types';

const DELEGATION_USERNAMES = [
  'abailly@akamai.com',
  'test-admin@example.com',
  'delegate-user1@example.com',
  'delegate-user2@example.com',
];

export const delegationSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Child Accounts and Delegations Seeds',
  group: { id: 'Child Accounts' },
  id: 'child-accounts:crud',
  label: 'Child Accounts & Delegations',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[delegationSeeder.id] ?? 3; // Default to 3 child accounts

    // 1. Seed Child Accounts (basic account info only)
    const childAccounts = childAccountFactory.buildList(count);

    // 2. Seed Delegations (many-to-many relationships)
    const delegations = [];
    let delegationId = 1;

    for (const childAccount of childAccounts) {
      const selectedUsers = pickRandomMultiple(DELEGATION_USERNAMES, 2);

      for (const username of selectedUsers) {
        delegations.push({
          id: delegationId++,
          childAccountEuuid: childAccount.euuid,
          username,
        });
      }
    }

    const updatedMockState = {
      ...mockState,
      childAccounts: mockState.childAccounts.concat(childAccounts),
      delegations: mockState.delegations.concat(delegations),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

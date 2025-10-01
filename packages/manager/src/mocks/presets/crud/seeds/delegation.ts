import {
  childAccountFactory,
  mockDelegateUsersList,
  pickRandomMultiple,
} from '@linode/utilities';

import { getSeedsCountMap } from 'src/dev-tools/utils';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockSeeder, MockState } from 'src/mocks/types';

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
      // Randomly assign 1-3 users to each child account
      const numDelegates = Math.floor(Math.random() * 3) + 1;
      const selectedUsers = pickRandomMultiple(
        mockDelegateUsersList,
        numDelegates
      );

      for (const username of selectedUsers) {
        delegations.push({
          id: delegationId++,
          // childAccountEuuid: childAccount.euuid,
          childAccountEuuid: '23be8d61-f3f5-46bf-91f8-d4213b2b011d',
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

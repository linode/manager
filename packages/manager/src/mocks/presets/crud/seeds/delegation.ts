import {
  childAccountWithDelegatesFactory,
  mockDelegateUsersList,
  pickRandomMultiple,
} from '@linode/utilities';

import { getSeedsCountMap } from 'src/dev-tools/utils';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const delegationSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Child Accounts Seeds',
  group: { id: 'Child Accounts' },
  id: 'child-accounts:crud',
  label: 'Child Accounts',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[delegationSeeder.id] ?? 0;
    const childAccounts = [
      childAccountWithDelegatesFactory.build({
        users: mockDelegateUsersList,
      }),
      ...childAccountWithDelegatesFactory.buildList(count, {
        users: pickRandomMultiple(mockDelegateUsersList, count - 1),
      }),
    ];

    const updatedMockState = {
      ...mockState,
      childAccounts: mockState.childAccounts.concat(childAccounts),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

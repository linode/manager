import { getSeedsCountMap } from 'src/dev-tools/utils';
import { accountUserFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const usersSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Users Seeds',
  group: { id: 'Users' },
  id: 'users:crud',
  label: 'Users',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[usersSeeder.id] ?? 0;
    const users = accountUserFactory.buildList(count);

    const updatedMockState = {
      ...mockState,
      users: mockState.users.concat(users),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

import { getSeedsCountMap } from 'src/dev-tools/utils';
import { cloudNATFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const cloudNATSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'CloudNAT Seeds',
  group: { id: 'CloudNATs' },
  id: 'cloudnats:crud',
  label: 'CloudNATs',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[cloudNATSeeder.id] ?? 0;
    const cloudNATSeeds = cloudNATFactory.buildList(count);

    const updatedMockState = {
      ...mockState,
      cloudnats: cloudNATSeeds,
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

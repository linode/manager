import { getSeedsCountMap } from 'src/dev-tools/utils';
import { placementGroupFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import { seedWithUniqueIds } from 'src/mocks/presets/crud/seeds/utils';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const placementGroupSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Placement Groups Seeds',
  group: { id: 'Placement Groups' },
  id: 'placement-groups:crud',
  label: 'Placement Groups',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[placementGroupSeeder.id] ?? 0;
    const placementGroupSeeds = seedWithUniqueIds<'placementGroups'>({
      dbEntities: await mswDB.getAll('placementGroups'),
      seedEntities: placementGroupFactory.buildList(count, {
        is_compliant: true,
        members: [],
      }),
    });

    const updatedMockState = {
      ...mockState,
      placementGroups: mockState.placementGroups.concat(placementGroupSeeds),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

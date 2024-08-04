import { getMSWCountMap } from 'src/dev-tools/ServiceWorkerTool';
import { placementGroupFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import { seedWithUniqueIds } from 'src/mocks/utilities/seedUtils';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const placementGroupSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Placement Groups Seeds',
  group: 'Placement Groups',
  id: 'many-placement-groups',
  label: 'Placement Groups',

  seeder: async (mockState: MockState) => {
    const countMap = getMSWCountMap();
    const count = countMap[placementGroupSeeder.id] ?? 0;
    const placementGroupSeeds = seedWithUniqueIds<'placementGroups'>({
      dbEntities: await mswDB.getAll('placementGroups'),
      seedEntities: placementGroupFactory.buildList(count, {
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

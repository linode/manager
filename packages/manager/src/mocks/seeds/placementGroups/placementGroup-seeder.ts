import { getMSWCountMap } from 'src/dev-tools/ServiceWorkerTool';
import { placementGroupFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockState, MockSeeder } from 'src/mocks/types';

export const placementGroupSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Placement Groups Seeds',
  group: 'Placement Groups',
  id: 'many-placement-groups',
  label: 'Placement Groups',

  seeder: async (mockState: MockState) => {
    const countMap = getMSWCountMap();
    const count = countMap[placementGroupSeeder.id] ?? 0;
    const placementGroups = placementGroupFactory.buildList(count);

    const updatedMockState = {
      ...mockState,
      placementGroups: mockState.placementGroups.concat(placementGroups),
    };

    await mswDB.saveStore(updatedMockState, 'seedContext');

    return updatedMockState;
  },
};

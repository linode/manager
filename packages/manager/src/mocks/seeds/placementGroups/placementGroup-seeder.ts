import { getMSWCountMap } from 'src/dev-tools/ServiceWorkerTool';
import { placementGroupFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockContext, MockContextSeeder } from 'src/mocks/types';

export const placementGroupSeeder: MockContextSeeder = {
  canUpdateCount: true,
  desc: 'Populates Placement Groups',
  group: 'Placement Groups',
  id: 'many-placement-groups',
  label: 'Placement Groups',

  seeder: async (mockContext: MockContext) => {
    const countMap = getMSWCountMap();
    const count = countMap[placementGroupSeeder.id] ?? 0;
    const placementGroups = placementGroupFactory.buildList(count);

    const updatedMockContext = {
      ...mockContext,
      placementGroups: mockContext.placementGroups.concat(placementGroups),
    };

    await mswDB.saveStore(updatedMockContext, 'seedContext');

    return updatedMockContext;
  },
};

import { getMSWCountMap } from 'src/dev-tools/ServiceWorkerTool';
import { placementGroupFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockContext, MockContextPopulator } from 'src/mocks/types';

export const placementGroupPopulator: MockContextPopulator = {
  canUpdateCount: true,
  desc: 'Populates Placement Groups',
  group: 'Placement Groups',
  id: 'many-placement-groups',
  label: 'Placement Groups',

  populator: async (mockContext: MockContext) => {
    const countMap = getMSWCountMap();
    const count = countMap[placementGroupPopulator.id] ?? 0;
    const placementGroups = placementGroupFactory.buildList(count);

    const updatedMockContext = {
      ...mockContext,
      placementGroups: mockContext.placementGroups.concat(placementGroups),
    };

    await mswDB.saveStore(updatedMockContext, 'seedContext');

    return updatedMockContext;
  },
};

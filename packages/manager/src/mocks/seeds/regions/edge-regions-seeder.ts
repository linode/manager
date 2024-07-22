import { edgeRegions } from 'src/__data__/edgeRegionsData';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockContext, MockContextSeeder } from 'src/mocks/types';

export const edgeRegionsSeeder: MockContextSeeder = {
  desc: 'Edge region seeds',
  group: 'Regions',
  id: 'edge-regions',
  label: 'Edge Regions',

  seeder: async (mockContext: MockContext) => {
    const updatedMockContext = {
      ...mockContext,
      regions: mockContext.regions.concat(edgeRegions),
    };

    await mswDB.saveStore(updatedMockContext, 'seedContext');

    return updatedMockContext;
  },
};

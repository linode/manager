import { productionRegions } from 'src/__data__/productionRegionsData';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockContext, MockContextSeeder } from 'src/mocks/types';

export const productionRegionsSeeder: MockContextSeeder = {
  desc: 'Production-like region seeds',
  group: 'Regions',
  id: 'prod-regions',
  label: 'Production Regions',

  seeder: async (mockContext: MockContext) => {
    const updatedMockContext = {
      ...mockContext,
      regions: mockContext.regions.concat(productionRegions),
    };

    await mswDB.saveStore(updatedMockContext, 'seedContext');

    return updatedMockContext;
  },
};

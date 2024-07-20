import { productionRegions } from 'src/__data__/productionRegionsData';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockContext, MockContextPopulator } from 'src/mocks/types';

/**
 * Populates context with Regions that simulate our Production regions.
 */
export const productionRegionsPopulator: MockContextPopulator = {
  desc: 'Populates context with Production-like region data',
  group: 'Regions',
  id: 'prod-regions',
  label: 'Production Regions',

  populator: async (mockContext: MockContext) => {
    const updatedMockContext = {
      ...mockContext,
      regions: mockContext.regions.concat(productionRegions),
    };

    await mswDB.saveStore(updatedMockContext, 'seedContext');

    return updatedMockContext;
  },
};

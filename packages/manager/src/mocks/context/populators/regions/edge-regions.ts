import { edgeRegions } from 'src/__data__/edgeRegionsData';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockContext, MockContextPopulator } from 'src/mocks/types';

/**
 * Populates context with Regions that simulate our Production regions.
 */
export const edgeRegionsPopulator: MockContextPopulator = {
  desc: 'Populates context with mock Edge region data',
  group: 'Regions',
  id: 'edge-regions',
  label: 'Edge Regions',

  populator: async (mockContext: MockContext) => {
    const updatedMockContext = {
      ...mockContext,
      regions: mockContext.regions.concat(edgeRegions),
    };

    await mswDB.saveStore(updatedMockContext, 'seedContext');

    return updatedMockContext;
  },
};

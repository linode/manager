import { edgeRegions } from 'src/__data__/edgeRegionsData';

import type { MockContext, MockContextPopulator } from 'src/mocks/types';

/**
 * Populates context with Regions that simulate our Production regions.
 */
export const edgeRegionsPopulator: MockContextPopulator = {
  desc: 'Populates context with mock Edge region data',
  group: 'Environment',
  id: 'edge-regions',
  label: 'Edge Regions',

  populator: (mockContext: MockContext) => {
    mockContext.regions.push(...edgeRegions);
    return mockContext;
  },
};

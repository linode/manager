import { productionRegions } from 'src/__data__/productionRegionsData';

import type { MockContext, MockContextPopulator } from 'src/mocks/types';

/**
 * Populates context with Regions that simulate our Production regions.
 */
export const productionRegionsPopulator: MockContextPopulator = {
  desc: 'Populates context with Production-like region data',
  group: 'Environment',
  id: 'prod-regions',
  label: 'Production Regions',

  populator: (mockContext: MockContext) => {
    mockContext.regions.push(...productionRegions);
    return mockContext;
  },
};

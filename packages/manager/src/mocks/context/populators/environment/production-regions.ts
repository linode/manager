import { productionRegions } from 'src/__data__/productionRegionsData';
import type { MockContext, MockContextPopulator } from 'src/mocks/mockContext';

/**
 * Populates context with Regions that simulate our Production regions.
 */
export const productionRegionsPopulator: MockContextPopulator = {
  label: 'Production Regions',
  id: 'prod-regions',
  desc: 'Populates context with Production-like region data',
  group: 'Environment',

  populator: (mockContext: MockContext) => {
    mockContext.regions.push(...productionRegions);
    return mockContext;
  },
};

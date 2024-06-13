import { edgeRegions } from 'src/__data__/edgeRegionsData';
import type { MockContext, MockContextPopulator } from 'src/mocks/mockContext';

/**
 * Populates context with Regions that simulate our Production regions.
 */
export const edgeRegionsPopulator: MockContextPopulator = {
  label: 'Edge Regions',
  id: 'edge-regions',
  desc: 'Populates context with mock Edge region data',
  group: 'Environment',

  populator: (mockContext: MockContext) => {
    mockContext.regions.push(...edgeRegions);
    return mockContext;
  },
};

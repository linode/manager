import { regions } from 'src/__data__/regionsData';
import type { MockContext, MockContextPopulator } from 'src/mocks/mockContext';

/**
 * Populates context with Regions that simulate our Production regions.
 */
export const legacyRegionsPopulator: MockContextPopulator = {
  label: 'Legacy Test Regions',
  id: 'legacy-test-regions',
  desc: 'Populates context with legacy mock region data',
  group: 'Environment',

  populator: (mockContext: MockContext) => {
    mockContext.regions.push(...regions);
    return mockContext;
  },
};

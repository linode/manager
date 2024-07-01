import { regions } from 'src/__data__/regionsData';

import type { MockContext, MockContextPopulator } from 'src/mocks/types';

/**
 * Populates context with Regions that simulate our Production regions.
 */
export const legacyRegionsPopulator: MockContextPopulator = {
  desc: 'Populates context with legacy mock region data',
  group: 'Environment',
  id: 'legacy-test-regions',
  label: 'Legacy Test Regions',

  populator: (mockContext: MockContext) => {
    mockContext.regions.push(...regions);
    return mockContext;
  },
};

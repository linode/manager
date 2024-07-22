import { regions } from 'src/__data__/regionsData';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockContext, MockContextSeeder } from 'src/mocks/types';

/**
 * Populates context with Regions that simulate our Production regions.
 */
export const legacyRegionsSeeder: MockContextSeeder = {
  desc: 'Populates context with legacy mock region data',
  group: 'Regions',
  id: 'legacy-test-regions',
  label: 'Legacy Test Regions',

  seeder: async (mockContext: MockContext) => {
    const updatedMockContext = {
      ...mockContext,
      regions: mockContext.regions.concat(regions),
    };

    await mswDB.saveStore(updatedMockContext, 'seedContext');

    return updatedMockContext;
  },
};

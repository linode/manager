import { regions } from 'src/__data__/regionsData';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockContext, MockContextSeeder } from 'src/mocks/types';

export const legacyRegionsSeeder: MockContextSeeder = {
  desc: 'Legacy region data seeds',
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

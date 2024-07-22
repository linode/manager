import { regions } from 'src/__data__/regionsData';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockState, MockSeeder } from 'src/mocks/types';

export const legacyRegionsSeeder: MockSeeder = {
  desc: 'Legacy region data seeds',
  group: 'Regions',
  id: 'legacy-test-regions',
  label: 'Legacy Test Regions',

  seeder: async (mockState: MockState) => {
    const updatedMockState = {
      ...mockState,
      regions: mockState.regions.concat(regions),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

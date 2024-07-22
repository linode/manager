import { productionRegions } from 'src/__data__/productionRegionsData';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockState, MockSeeder } from 'src/mocks/types';

export const productionRegionsSeeder: MockSeeder = {
  desc: 'Production-like region seeds',
  group: 'Regions',
  id: 'prod-regions',
  label: 'Production Regions',

  seeder: async (mockState: MockState) => {
    const updatedMockState = {
      ...mockState,
      regions: mockState.regions.concat(productionRegions),
    };

    await mswDB.saveStore(updatedMockState, 'seedContext');

    return updatedMockState;
  },
};

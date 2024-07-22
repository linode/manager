import { edgeRegions } from 'src/__data__/edgeRegionsData';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockState, MockSeeder } from 'src/mocks/types';

export const edgeRegionsSeeder: MockSeeder = {
  desc: 'Edge region seeds',
  group: 'Regions',
  id: 'edge-regions',
  label: 'Edge Regions',

  seeder: async (mockState: MockState) => {
    const updatedMockState = {
      ...mockState,
      regions: mockState.regions.concat(edgeRegions),
    };

    await mswDB.saveStore(updatedMockState, 'seedContext');

    return updatedMockState;
  },
};

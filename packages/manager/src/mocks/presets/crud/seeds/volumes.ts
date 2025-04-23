import { getSeedsCountMap } from 'src/dev-tools/utils';
import { volumeFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const volumesSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Volumes Seeds',
  group: { id: 'Volumes' },
  id: 'volumes:crud',
  label: 'Volumes',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[volumesSeeder.id] ?? 0;
    const volumes = volumeFactory.buildList(count);

    const updatedMockState = {
      ...mockState,
      volumes: mockState.volumes.concat(volumes),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

import { getMSWCountMap } from 'src/dev-tools/ServiceWorkerTool';
import { volumeFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockState, MockSeeder } from 'src/mocks/types';

export const volumesSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Volumes Seeds',
  group: 'Volumes',
  id: 'many-volumes',
  label: 'Volumes',

  seeder: async (mockState: MockState) => {
    const countMap = getMSWCountMap();
    const count = countMap[volumesSeeder.id] ?? 0;
    const volumes = volumeFactory.buildList(count);

    const updatedMockState = {
      ...mockState,
      volumes: mockState.volumes.concat(volumes),
    };

    await mswDB.saveStore(updatedMockState, 'seedContext');

    return updatedMockState;
  },
};

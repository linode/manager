import { getMSWCountMap } from 'src/dev-tools/ServiceWorkerTool';
import { volumeFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockContext, MockContextSeeder } from 'src/mocks/types';

export const volumesSeeder: MockContextSeeder = {
  canUpdateCount: true,
  desc: 'Populates Volumes',
  group: 'Volumes',
  id: 'many-volumes',
  label: 'Volumes',

  seeder: async (mockContext: MockContext) => {
    const countMap = getMSWCountMap();
    const count = countMap[volumesSeeder.id] ?? 0;
    const volumes = volumeFactory.buildList(count);

    const updatedMockContext = {
      ...mockContext,
      volumes: mockContext.volumes.concat(volumes),
    };

    await mswDB.saveStore(updatedMockContext, 'seedContext');

    return updatedMockContext;
  },
};

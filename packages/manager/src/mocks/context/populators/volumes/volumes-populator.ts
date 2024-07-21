import { getMSWCountMap } from 'src/dev-tools/ServiceWorkerTool';
import { volumeFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockContext, MockContextPopulator } from 'src/mocks/types';

export const volumesPopulator: MockContextPopulator = {
  defaultCount: 5,
  desc: 'Populates Volumes',
  group: 'Volumes',
  id: 'many-volumes',
  label: 'Volumes',

  populator: async (mockContext: MockContext) => {
    const countMap = getMSWCountMap() ?? volumesPopulator.defaultCount;
    const count =
      countMap[volumesPopulator.id] ?? volumesPopulator.defaultCount;
    const volumes = volumeFactory.buildList(count);

    const updatedMockContext = {
      ...mockContext,
      volumes: mockContext.volumes.concat(volumes),
    };

    await mswDB.saveStore(updatedMockContext, 'seedContext');

    return updatedMockContext;
  },
};

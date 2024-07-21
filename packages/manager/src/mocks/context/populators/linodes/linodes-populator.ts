import { getMSWCountMap } from 'src/dev-tools/ServiceWorkerTool';
import { configFactory, linodeFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { Config } from '@linode/api-v4';
import type { MockContext, MockContextPopulator } from 'src/mocks/types';

export const linodesPopulator: MockContextPopulator = {
  defaultCount: 100,
  desc: 'Populates Linodes',
  group: 'Linodes',
  id: 'many-linodes',
  label: 'Linodes',

  populator: async (mockContext: MockContext) => {
    const countMap = getMSWCountMap() ?? linodesPopulator.defaultCount;
    const count =
      countMap[linodesPopulator.id] ?? linodesPopulator.defaultCount;
    const linodes = linodeFactory.buildList(count);
    const configs: [number, Config][] = linodes.map((linode) => {
      return [linode.id, configFactory.build()];
    });

    const updatedMockContext = {
      ...mockContext,
      linodeConfigs: mockContext.linodeConfigs.concat(configs),
      linodes: mockContext.linodes.concat(linodes),
    };

    await mswDB.saveStore(updatedMockContext, 'seedContext');

    return updatedMockContext;
  },
};

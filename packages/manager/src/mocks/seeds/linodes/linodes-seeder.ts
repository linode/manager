import { getMSWCountMap } from 'src/dev-tools/ServiceWorkerTool';
import { configFactory, linodeFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { Config } from '@linode/api-v4';
import type { MockContext, MockContextSeeder } from 'src/mocks/types';

export const linodesSeeder: MockContextSeeder = {
  canUpdateCount: true,
  desc: 'Populates Linodes',
  group: 'Linodes',
  id: 'many-linodes',
  label: 'Linodes',

  seeder: async (mockContext: MockContext) => {
    const countMap = getMSWCountMap();
    const count = countMap[linodesSeeder.id] ?? 0;
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

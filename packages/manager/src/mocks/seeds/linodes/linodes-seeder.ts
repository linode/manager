import { getMSWCountMap } from 'src/dev-tools/ServiceWorkerTool';
import { configFactory, linodeFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { Config } from '@linode/api-v4';
import type { MockSeeder, MockState } from 'src/mocks/types';

export const linodesSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Linodes Seeds',
  group: 'Linodes',
  id: 'many-linodes',
  label: 'Linodes',

  seeder: async (mockState: MockState) => {
    const countMap = getMSWCountMap();
    const count = countMap[linodesSeeder.id] ?? 0;
    const linodes = linodeFactory.buildList(count);
    const configs: [number, Config][] = linodes.map((linode) => {
      return [linode.id, configFactory.build()];
    });

    const updatedMockState = {
      ...mockState,
      linodeConfigs: mockState.linodeConfigs.concat(configs),
      linodes: mockState.linodes.concat(linodes),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

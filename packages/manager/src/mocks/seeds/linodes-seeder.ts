import { getMSWSeedsCountMap } from 'src/dev-tools/ServiceWorkerTool';
import { configFactory, linodeFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import { seedWithUniqueIds } from 'src/mocks/utilities/seedUtils';

import type { Config } from '@linode/api-v4';
import type { MockSeeder, MockState } from 'src/mocks/types';

export const linodesSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Linodes Seeds',
  group: 'Linodes',
  id: 'many-linodes',
  label: 'Linodes',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getMSWSeedsCountMap();
    const count = seedsCountMap[linodesSeeder.id] ?? 0;
    const linodeSeeds = seedWithUniqueIds<'linodes'>({
      dbEntities: await mswDB.getAll('linodes'),
      seedEntities: linodeFactory.buildList(count),
    });

    const configs: [number, Config][] = linodeSeeds.map((linodeSeed) => {
      return [linodeSeed.id, configFactory.build()];
    });

    const updatedMockState = {
      ...mockState,
      linodeConfigs: mockState.linodeConfigs.concat(configs),
      linodes: mockState.linodes.concat(linodeSeeds),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

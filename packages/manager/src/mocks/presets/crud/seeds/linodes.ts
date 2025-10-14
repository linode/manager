import { configFactory, linodeFactory } from '@linode/utilities';

import { getSeedsCountMap } from 'src/dev-tools/utils';
import { addToEntities, mswDB } from 'src/mocks/indexedDB';
import { seedWithUniqueIds } from 'src/mocks/presets/crud/seeds/utils';

import type { Config } from '@linode/api-v4';
import type { MockSeeder, MockState } from 'src/mocks/types';

export const linodesSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Linodes Seeds',
  group: { id: 'Linodes' },
  id: 'linodes:crud',
  label: 'Linodes',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[linodesSeeder.id] ?? 0;
    const linodeSeeds = seedWithUniqueIds<'linodes'>({
      dbEntities: await mswDB.getAll('linodes'),
      seedEntities: linodeFactory.buildList(count, {
        capabilities: ['Block Storage Performance B1'],
      }),
    });

    const configs: [number, Config][] = linodeSeeds.map((linodeSeed) => {
      return [linodeSeed.id, configFactory.build()];
    });

    addToEntities(mockState, 'linodes', linodeSeeds);

    const updatedMockState = {
      ...mockState,
      linodeConfigs: mockState.linodeConfigs.concat(configs),
      linodes: mockState.linodes.concat(linodeSeeds),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

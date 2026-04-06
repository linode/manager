import { getSeedsCountMap } from 'src/dev-tools/utils';
import { domainFactory } from 'src/factories';
import { addToEntities, mswDB } from 'src/mocks/indexedDB';
import { seedWithUniqueIds } from 'src/mocks/presets/crud/seeds/utils';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const domainSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Domains Seeds',
  group: { id: 'Domains' },
  id: 'domains:crud',
  label: 'Domains',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[domainSeeder.id] ?? 0;
    const domainSeeds = seedWithUniqueIds<'domains'>({
      dbEntities: await mswDB.getAll('domains'),
      seedEntities: domainFactory.buildList(count),
    });

    addToEntities(mockState, 'domains', domainSeeds);

    const updatedMockState = {
      ...mockState,
      domains: mockState.domains.concat(domainSeeds),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

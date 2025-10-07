import { getSeedsCountMap } from 'src/dev-tools/utils';
import { entityFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const entitiesSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Entities Seeds',
  group: { id: 'Entities' },
  id: 'entities:crud',
  label: 'Entities',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[entitiesSeeder.id] ?? 0;
    const entities = entityFactory.buildList(count);

    const updatedMockState = {
      ...mockState,
      entities: mockState.entities.concat(entities),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

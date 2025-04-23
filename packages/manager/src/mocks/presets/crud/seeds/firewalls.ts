import { getSeedsCountMap } from 'src/dev-tools/utils';
import { firewallFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import { seedWithUniqueIds } from 'src/mocks/presets/crud/seeds/utils';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const firewallSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Firewall Seeds',
  group: { id: 'Firewalls' },
  id: 'firewalls:crud',
  label: 'Firewalls',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[firewallSeeder.id] ?? 0;
    const firewallSeeds = seedWithUniqueIds<'firewalls'>({
      dbEntities: await mswDB.getAll('firewalls'),
      seedEntities: firewallFactory.buildList(count),
    });

    const updatedMockState = {
      ...mockState,
      firewalls: mockState.firewalls.concat(firewallSeeds),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

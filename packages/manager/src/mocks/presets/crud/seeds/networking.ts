import { getSeedsCountMap } from 'src/dev-tools/utils';
import { ipAddressFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import { seedWithUniqueIds } from 'src/mocks/presets/crud/seeds/utils';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const ipAddressSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'IP Address Seeds',
  group: { id: 'IP Addresses' },
  id: 'ip-addresses:crud',
  label: 'IP Addresses',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[ipAddressSeeder.id] ?? 0;
    const ipAddressSeeds = seedWithUniqueIds<'ipAddresses'>({
      dbEntities: await mswDB.getAll('ipAddresses'),
      seedEntities: ipAddressFactory.buildList(count),
    });

    const updatedMockState = {
      ...mockState,
      ipAddresses: mockState.ipAddresses.concat(ipAddressSeeds),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

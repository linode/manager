import { getSeedsCountMap } from 'src/dev-tools/utils';
import { vpcFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import { seedWithUniqueIds } from 'src/mocks/presets/crud/seeds/utils';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const vpcSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'VPC Seeds',
  group: { id: 'VPCs' },
  id: 'vpcs:crud',
  label: 'VPCs',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[vpcSeeder.id] ?? 0;
    const vpcSeeds = seedWithUniqueIds<'vpcs'>({
      dbEntities: await mswDB.getAll('vpcs'),
      seedEntities: vpcFactory.buildList(count),
    });

    const updatedMockState = {
      ...mockState,
      vpcs: mockState.vpcs.concat(vpcSeeds),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

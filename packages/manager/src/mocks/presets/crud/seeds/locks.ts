import { getSeedsCountMap } from 'src/dev-tools/utils';
import { lockFactory } from 'src/factories';
import { addToEntities, mswDB } from 'src/mocks/indexedDB';
import { seedWithUniqueIds } from 'src/mocks/presets/crud/seeds/utils';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const locksSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Resource Lock Seeds',
  group: { id: 'Locks' },
  id: 'locks:crud',
  label: 'Resource Locks',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[locksSeeder.id] ?? 0;

    // Get existing linodes to create realistic locks
    const linodes = await mswDB.getAll('linodes');
    const availableLinodes =
      linodes?.slice(0, Math.min(count, linodes.length)) || [];

    const lockSeeds = availableLinodes.map((linode, index) =>
      lockFactory.build({
        entity: {
          id: linode.id,
          type: 'linode',
          label: linode.label,
          url: `/v4/linode/instances/${linode.id}`,
        },
        lock_type:
          index % 2 === 0 ? 'cannot_delete' : 'cannot_delete_with_subresources',
      })
    );

    const uniqueLockSeeds = seedWithUniqueIds<'locks'>({
      dbEntities: await mswDB.getAll('locks'),
      seedEntities: lockSeeds,
    });

    addToEntities(mockState, 'locks', uniqueLockSeeds);

    const updatedMockState = {
      ...mockState,
      locks: mockState.locks.concat(uniqueLockSeeds),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');
    return updatedMockState;
  },
};

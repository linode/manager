import {
  nodeBalancerConfigFactory,
  nodeBalancerConfigNodeFactory,
  nodeBalancerFactory,
} from '@linode/utilities';

import { getSeedsCountMap } from 'src/dev-tools/utils';
import { mswDB } from 'src/mocks/indexedDB';
import { seedWithUniqueIds } from 'src/mocks/presets/crud/seeds/utils';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const nodeBalancerSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Nodebalancer Seeds',
  group: { id: 'NodeBalancers' },
  id: 'nodebalancers:crud',
  label: 'NodeBalancers',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[nodeBalancerSeeder.id] ?? 0;
    const nodeBalancerSeeds = seedWithUniqueIds<'nodeBalancers'>({
      dbEntities: await mswDB.getAll('nodeBalancers'),
      seedEntities: nodeBalancerFactory.buildList(count),
    });

    const nodeBalancerConfigSeeds = seedWithUniqueIds<'nodeBalancerConfigs'>({
      dbEntities: await mswDB.getAll('nodeBalancerConfigs'),
      seedEntities: nodeBalancerSeeds.map((nb) =>
        nodeBalancerConfigFactory.build({ nodebalancer_id: nb.id })
      ),
    });

    const nodeBalancerConfigNodeSeeds = seedWithUniqueIds<'nodeBalancerConfigNodes'>(
      {
        dbEntities: await mswDB.getAll('nodeBalancerConfigNodes'),
        seedEntities: nodeBalancerConfigSeeds.map((config) =>
          nodeBalancerConfigNodeFactory.build({
            address: '192.168.203.1',
            config_id: config.id,
            nodebalancer_id: config.nodebalancer_id,
          })
        ),
      }
    );

    const updatedMockState = {
      ...mockState,
      nodeBalancerConfigNodes: mockState.nodeBalancerConfigNodes.concat(
        nodeBalancerConfigNodeSeeds
      ),
      nodeBalancerConfigs: mockState.nodeBalancerConfigs.concat(
        nodeBalancerConfigSeeds
      ),
      nodeBalancers: mockState.nodeBalancers.concat(nodeBalancerSeeds),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

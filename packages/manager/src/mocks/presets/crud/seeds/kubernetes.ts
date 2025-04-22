import { getSeedsCountMap } from 'src/dev-tools/utils';
import { kubernetesClusterFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import { seedWithUniqueIds } from 'src/mocks/presets/crud/seeds/utils';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const kubernetesSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Kubernetes Seeds',
  group: { id: 'Kubernetes' },
  id: 'kubernetes:crud',
  label: 'Kubernetes',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[kubernetesSeeder.id] ?? 0;

    const kubernetesClusterSeeds = seedWithUniqueIds<'kubernetesClusters'>({
      dbEntities: await mswDB.getAll('kubernetesClusters'),
      seedEntities: kubernetesClusterFactory.buildList(count),
    });

    // const kubernetesNodePoolSeeds = seedWithUniqueIds<'kubernetesNodePools'>({
    //   dbEntities: await mswDB.getAll('kubernetesNodePools'),
    //   seedEntities: kubernetesClusterSeeds.map((cluster) => {
    //     const nodePool: MockKubeNodePoolResponse = {
    //       ...nodePoolFactory.build(),
    //       clusterId: cluster?.id ?? -1,
    //     };
    //     return nodePool;
    //   }),
    // });

    const updatedMockState = {
      ...mockState,
      kubernetesClusters: mockState.kubernetesClusters.concat(
        kubernetesClusterSeeds
      ),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};

import { mockState } from 'src/dev-tools/load';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockSeeder, MockState } from 'src/mocks/types';

/**
 * Removes the seeds from the database.
 * This function is called upon unchecking an individual seeder in the MSW.
 *
 * @param seederId - The ID of the seeder to remove.
 *
 * @returns The mock state with the seeds removed.
 */
export const removeSeeds = async (seederId: MockSeeder['id']) => {
  switch (seederId) {
    case 'domains:crud':
      await mswDB.deleteAll('domains', mockState, 'seedState');
      break;
    case 'firewalls:crud':
      await mswDB.deleteAll('firewalls', mockState, 'seedState');
      await mswDB.deleteAll('firewallDevices', mockState, 'seedState');
      break;
    case 'ip-addresses:crud':
      await mswDB.deleteAll('ipAddresses', mockState, 'seedState');
      break;
    case 'kubernetes:crud':
      await mswDB.deleteAll('kubernetesClusters', mockState, 'seedState');
      await mswDB.deleteAll('kubernetesNodePools', mockState, 'seedState');
      break;
    case 'linodes:crud':
      await mswDB.deleteAll('linodes', mockState, 'seedState');
      await mswDB.deleteAll('linodeConfigs', mockState, 'seedState');
      break;
    case 'nodebalancers:crud':
      await mswDB.deleteAll('nodeBalancers', mockState, 'seedState');
      await mswDB.deleteAll('nodeBalancerConfigs', mockState, 'seedState');
      await mswDB.deleteAll('nodeBalancerConfigNodes', mockState, 'seedState');
      break;
    case 'placement-groups:crud':
      await mswDB.deleteAll('placementGroups', mockState, 'seedState');
      break;
    case 'volumes:crud':
      await mswDB.deleteAll('volumes', mockState, 'seedState');
      break;
    case 'support-tickets:crud':
      await mswDB.deleteAll('supportTickets', mockState, 'seedState');
      break;
    case 'vpcs:crud':
      await mswDB.deleteAll('vpcs', mockState, 'seedState');
      await mswDB.deleteAll('subnets', mockState, 'seedState');
      break;
    default:
      break;
  }

  return mockState;
};

type WithId = {
  id: number;
};

/**
 * Type guard to check if an object has an 'id' property
 *
 * @param obj - The object to check.
 *
 * @returns True if the object has an 'id' property, false otherwise.
 */
export const hasId = (obj: any): obj is WithId => {
  return 'id' in obj;
};

interface SeedWithUniqueIdsArgs<T extends keyof MockState> {
  dbEntities: MockState[T] | undefined;
  seedEntities: MockState[T];
}

/**
 * Ensures that the seed entities have unique IDs by incrementing them if they
 * are already taken.
 *
 * @param dbEntities - The entities from the database.
 * @param seedEntities - The entities to seed.
 *
 * @returns The seed entities with unique IDs.
 */
export const seedWithUniqueIds = <T extends keyof MockState>({
  dbEntities,
  seedEntities,
}: SeedWithUniqueIdsArgs<T>) => {
  if (!dbEntities || dbEntities.length === 0) {
    return seedEntities;
  }

  const allEntities = [...dbEntities, ...seedEntities];

  seedEntities.forEach((seedEntity) => {
    if (!hasId(seedEntity)) {
      return;
    }

    let seedEntityId = seedEntity.id;

    while (
      allEntities.some(
        // eslint-disable-next-line no-loop-func
        (entity) => hasId(entity) && entity.id === seedEntityId
      )
    ) {
      seedEntityId++;
    }

    seedEntity.id = seedEntityId;
  });

  return seedEntities;
};

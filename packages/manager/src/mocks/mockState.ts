import { mswDB } from './indexedDB';

import type { MockSeeder, MockState } from './types';

/**
 * Describes a function that executes on each request to the events endpoint.
 *
 * Can be used to simulate progress or update state in response to an event.
 *
 * @returns `true` if event is considered complete, `false` if callback should continue to be called.
 */
export const getStateSeederGroups = (
  seeders: MockSeeder[]
): Array<string | undefined> => {
  return seeders.reduce((acc: Array<string | undefined>, cur) => {
    if (!acc.includes(cur.group.id)) {
      acc.push(cur.group.id);
    }

    return acc;
  }, []);
};

export const emptyStore: MockState = {
  domainRecords: [],
  domains: [],
  eventQueue: [],
  firewallDevices: [],
  firewalls: [],
  ipAddresses: [],
  kubernetesClusters: [],
  kubernetesNodePools: [],
  linodeConfigs: [],
  linodeInterfaces: [],
  linodes: [],
  nodeBalancerConfigNodes: [],
  nodeBalancerConfigs: [],
  nodeBalancers: [],
  notificationQueue: [],
  placementGroups: [],
  regionAvailability: [],
  regions: [],
  subnets: [],
  supportReplies: [],
  supportTickets: [],
  volumes: [],
  vpcs: [],
};

/**
 * Creates and returns an empty mock state.
 *
 * @returns Empty mock state.
 */
export const createInitialMockStore = async (): Promise<MockState> => {
  const mockState = await mswDB.getStore('mockState');

  if (mockState) {
    const mockStateKeys = Object.keys(mockState);
    const emptyStoreKeys = Object.keys(emptyStore);

    // Return the existing mockState if it includes all keys from the empty store;
    // else, discard the existing mockState because we've introduced new values.
    if (emptyStoreKeys.every((key) => mockStateKeys.includes(key))) {
      return mockState;
    }
  }

  return emptyStore;
};

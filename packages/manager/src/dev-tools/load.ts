import { ENABLE_DEV_TOOLS } from 'src/constants';
import { mswDB } from 'src/mocks/indexedDB';
import { resolveMockPreset } from 'src/mocks/mockPreset';
import { createInitialMockStore, emptyStore } from 'src/mocks/mockState';
import { allMockPresets, defaultBaselineMockPreset } from 'src/mocks/presets';
import { dbSeeders } from 'src/mocks/presets/crud/seeds';

import {
  getBaselinePreset,
  getExtraPresets,
  getSeeders,
  isMSWEnabled,
} from './utils';

import type { QueryClient } from '@tanstack/react-query';
import type { MockPresetExtra, MockSeeder, MockState } from 'src/mocks/types';
import type { ApplicationStore } from 'src/store';

export let mockState: MockState;

/**
 * Use this to dynamically import our custom dev-tools ONLY when they
 * are needed.
 *
 * @param store Redux store to control
 */
export async function loadDevTools(
  store: ApplicationStore,
  client: QueryClient
) {
  const devTools = await import('./DevTools');

  if (isMSWEnabled) {
    const { worker: mswWorker } = await import('../mocks/mswWorkers');
    const mswPresetId = getBaselinePreset() ?? defaultBaselineMockPreset.id;
    const mswPreset =
      allMockPresets.find((preset) => preset.id === mswPresetId) ??
      defaultBaselineMockPreset;

    const extraMswPresetIds = getExtraPresets();
    const extraMswPresets = extraMswPresetIds
      .map((presetId) =>
        allMockPresets.find((extraPreset) => extraPreset.id === presetId)
      )
      .filter((preset) => !!preset);

    const mswContentSeederIds = getSeeders(dbSeeders);
    const mswContentSeeders = mswContentSeederIds
      .map((seederId) => dbSeeders.find((dbSeeder) => dbSeeder.id === seederId))
      .filter((seeder) => !!seeder);

    // Apply MSW context populators.
    const initialContext = await createInitialMockStore();
    await mswDB.saveStore(initialContext, 'mockState');

    // Seeding
    const seedContext = (await mswDB.getStore('seedState')) || emptyStore;

    const populateSeeds = async (store: MockState): Promise<MockState> => {
      return await mswContentSeeders.reduce(
        async (accPromise, cur: MockSeeder) => {
          const acc = await accPromise;

          return await cur.seeder(acc);
        },
        Promise.resolve(store)
      );
    };

    const updateSeedContext = async <T extends keyof MockState>(
      key: T,
      seeds: MockState
    ): Promise<void> => {
      seedContext[key] = seeds[key];
    };

    const seeds = await populateSeeds(emptyStore);

    const seedPromises = (Object.keys(seedContext) as (keyof MockState)[]).map(
      (key) => updateSeedContext(key, seeds)
    );

    await Promise.all(seedPromises);

    await mswDB.saveStore(seedContext ?? emptyStore, 'seedState');

    // Merge the contexts
    const mergedContext: MockState = {
      ...initialContext,
      domains: [...initialContext.domains, ...(seedContext?.domains || [])],
      eventQueue: [
        ...initialContext.eventQueue,
        ...(seedContext?.eventQueue || []),
      ],
      firewallDevices: [
        ...initialContext.firewallDevices,
        ...(seedContext?.firewallDevices || []),
      ],
      firewalls: [
        ...initialContext.firewalls,
        ...(seedContext?.firewalls || []),
      ],
      linodeConfigs: [
        ...initialContext.linodeConfigs,
        ...(seedContext?.linodeConfigs || []),
      ],
      linodes: [...initialContext.linodes, ...(seedContext?.linodes || [])],
      nodeBalancerConfigNodes: [
        ...initialContext.nodeBalancerConfigNodes,
        ...(seedContext.nodeBalancerConfigNodes || []),
      ],
      nodeBalancerConfigs: [
        ...initialContext.nodeBalancerConfigs,
        ...(seedContext.nodeBalancerConfigs || []),
      ],
      nodeBalancers: [
        ...initialContext.nodeBalancers,
        ...(seedContext.nodeBalancers || []),
      ],
      notificationQueue: [
        ...initialContext.notificationQueue,
        ...(seedContext?.notificationQueue || []),
      ],
      placementGroups: [
        ...initialContext.placementGroups,
        ...(seedContext?.placementGroups || []),
      ],
      regionAvailability: [
        ...initialContext.regionAvailability,
        ...(seedContext?.regionAvailability || []),
      ],
      regions: [...initialContext.regions, ...(seedContext?.regions || [])],
      subnets: [...initialContext.subnets, ...(seedContext?.subnets || [])],
      supportReplies: [
        ...initialContext.supportReplies,
        ...(seedContext?.supportReplies || []),
      ],
      supportTickets: [
        ...initialContext.supportTickets,
        ...(seedContext?.supportTickets || []),
      ],
      volumes: [...initialContext.volumes, ...(seedContext?.volumes || [])],
      vpcs: [...initialContext.vpcs, ...(seedContext?.vpcs || [])],
    };

    const extraHandlers = extraMswPresets.reduce(
      (acc, cur: MockPresetExtra) => {
        return [...resolveMockPreset(cur, mergedContext), ...acc];
      },
      []
    );

    const baseHandlers = resolveMockPreset(mswPreset, mergedContext);

    const worker = mswWorker(extraHandlers, baseHandlers);
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  devTools.install(store, client);
}

/**
 * Defaults to `true` for development
 * Default to `false` in production builds
 *
 * Define `REACT_APP_ENABLE_DEV_TOOLS` to explicitly enable or disable dev tools
 */
export const shouldLoadDevTools =
  ENABLE_DEV_TOOLS !== undefined ? ENABLE_DEV_TOOLS : import.meta.env.DEV;

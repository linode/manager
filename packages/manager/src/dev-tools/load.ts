import { ENABLE_DEV_TOOLS } from 'src/constants';
import { mswDB } from 'src/mocks/indexedDB';
import { createInitialMockStore, emptyStore } from 'src/mocks/mockContext';
import { resolveMockPreset } from 'src/mocks/mockPreset';
import { allMockPresets, defaultBaselineMockPreset } from 'src/mocks/presets';
import { allContextSeeders } from 'src/mocks/seeds';

import {
  getMSWContextSeeders,
  getMSWExtraPresets,
  getMSWPreset,
  isMSWEnabled,
} from './ServiceWorkerTool';

import type { QueryClient } from '@tanstack/react-query';
import type {
  MockContext,
  MockContextSeeder,
  MockPreset,
} from 'src/mocks/types';
import type { ApplicationStore } from 'src/store';

export let mockState: MockContext;

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
  const devTools = await import('./dev-tools');

  if (isMSWEnabled) {
    const { worker: mswWorker } = await import('../mocks/mswWorkers');
    const mswPresetId = getMSWPreset() ?? defaultBaselineMockPreset.id;
    const mswPreset =
      allMockPresets.find((preset) => preset.id === mswPresetId) ??
      defaultBaselineMockPreset;

    const extraMswPresetIds = getMSWExtraPresets();
    const extraMswPresets = extraMswPresetIds
      .map((presetId) =>
        allMockPresets.find((extraPreset) => extraPreset.id === presetId)
      )
      .filter((preset) => !!preset);

    const mswContentSeederIds = getMSWContextSeeders();
    const mswContentSeeders = mswContentSeederIds
      .map((seederId) =>
        allContextSeeders.find((seeder) => seeder.id === seederId)
      )
      .filter((seeder) => !!seeder);

    // Apply MSW context populators.
    const initialContext = await createInitialMockStore();
    await mswDB.saveStore(initialContext, 'mockContext');

    // Seeding
    const seedContext = (await mswDB.getStore('seedContext')) || emptyStore;

    const populateSeeds = async (store: MockContext): Promise<MockContext> => {
      return await mswContentSeeders.reduce(
        async (accPromise, cur: MockContextSeeder) => {
          const acc = await accPromise;

          return await cur.seeder(acc);
        },
        Promise.resolve(store)
      );
    };

    const updateSeedContext = async <T extends keyof MockContext>(
      key: T,
      seeds: MockContext
    ): Promise<void> => {
      seedContext[key] = seeds[key];
    };

    const seeds = await populateSeeds(emptyStore);

    const seedPromises = (Object.keys(
      seedContext
    ) as (keyof MockContext)[]).map((key) => updateSeedContext(key, seeds));

    await Promise.all(seedPromises);

    await mswDB.saveStore(seedContext ?? emptyStore, 'seedContext');

    // Merge the contexts
    const mergedContext: MockContext = {
      ...initialContext,
      eventQueue: [
        ...initialContext.eventQueue,
        ...(seedContext?.eventQueue || []),
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
      volumes: [...initialContext.volumes, ...(seedContext?.volumes || [])],
    };

    const extraHandlers = extraMswPresets.reduce((acc, cur: MockPreset) => {
      return [...resolveMockPreset(cur, mergedContext), ...acc];
    }, []);

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
export const shouldEnableDevTools =
  ENABLE_DEV_TOOLS !== undefined ? ENABLE_DEV_TOOLS : import.meta.env.DEV;

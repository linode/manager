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

import type { MockPresetExtra, MockSeeder, MockState } from 'src/mocks/types';

export let mockState: MockState;

/**
 * Use this to dynamically import our custom dev-tools ONLY when they
 * are needed.
 *
 * @param store Redux store to control
 */
export async function loadDevTools() {
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
      ...Object.fromEntries(
        Object.keys(initialContext).map((key) => {
          const k = key as keyof MockState;
          const initialValue = initialContext[k];
          const seedValue = seedContext?.[k];

          if (Array.isArray(initialValue) && Array.isArray(seedValue)) {
            return [k, [...initialValue, ...seedValue]];
          } else if (seedValue !== undefined) {
            return [k, seedValue];
          } else {
            return [k, initialValue];
          }
        })
      ),
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
}

import { ENABLE_DEV_TOOLS } from 'src/constants';
import { allContextPopulators } from 'src/mocks/context/populators';
import { mswDB } from 'src/mocks/indexedDB';
import { createInitialMockStore } from 'src/mocks/mockContext';
import { resolveMockPreset } from 'src/mocks/mockPreset';
import { allMockPresets, defaultBaselineMockPreset } from 'src/mocks/presets';

import {
  getMSWContextPopulators,
  getMSWExtraPresets,
  getMSWPreset,
  isMSWEnabled,
} from './ServiceWorkerTool';

import type { QueryClient } from '@tanstack/react-query';
import type {
  MockContext,
  MockContextPopulator,
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

    const mswContentPopulatorIds = getMSWContextPopulators();
    const mswContentPopulators = mswContentPopulatorIds
      .map((populatorId) =>
        allContextPopulators.find((populator) => populator.id === populatorId)
      )
      .filter((populator) => !!populator);

    // Apply MSW context populators.
    const initialContext = await createInitialMockStore();

    mockState = await mswContentPopulators.reduce(
      async (accPromise, cur: MockContextPopulator) => {
        const acc = await accPromise;
        return cur.populator(acc);
      },
      Promise.resolve(initialContext)
    );

    await mswDB.saveStore(initialContext, 'mockContext');
    await mswDB.saveStore(mockState, 'seedContext');

    const seedContext = await mswDB.getStore('seedContext');
    const mergedContext: MockContext = {
      ...mockState,
      eventQueue: [...mockState.eventQueue, ...(seedContext?.eventQueue || [])],
      firewalls: [...mockState.firewalls, ...(seedContext?.firewalls || [])],
      linodeConfigs: [
        ...mockState.linodeConfigs,
        ...(seedContext?.linodeConfigs || []),
      ],
      linodes: [...mockState.linodes, ...(seedContext?.linodes || [])],
      notificationQueue: [
        ...mockState.notificationQueue,
        ...(seedContext?.notificationQueue || []),
      ],
      placementGroups: [
        ...mockState.placementGroups,
        ...(seedContext?.placementGroups || []),
      ],
      regionAvailability: [
        ...mockState.regionAvailability,
        ...(seedContext?.regionAvailability || []),
      ],
      regions: [...mockState.regions, ...(seedContext?.regions || [])],
      volumes: [...mockState.volumes, ...(seedContext?.volumes || [])],
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

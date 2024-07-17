import { ENABLE_DEV_TOOLS } from 'src/constants';
import { allContextPopulators } from 'src/mocks/context/populators';
import { mswDB } from 'src/mocks/indexedDB';
import { createInitialMockContext } from 'src/mocks/mockContext';
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
    const mockContext = mswContentPopulators.reduce(
      (acc: MockContext, cur: MockContextPopulator) => {
        return cur.populator(acc);
      },
      await createInitialMockContext()
    );

    mswDB.saveStore(mockContext);

    const extraHandlers = extraMswPresets.reduce((acc, cur: MockPreset) => {
      return [
        // MSW applies the first handler that is set up for any given request,
        // so we must apply extra handlers in the opposite order that they are
        // specified.
        ...resolveMockPreset(cur, mockContext),
        ...acc,
      ];
    }, []);

    const baseHandlers = resolveMockPreset(mswPreset, mockContext);

    // Because MSW applies the first handler that is set up for any given request,
    // we must apply extra request handlers before base handlers.
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

import { setupWorker } from 'msw/browser';

import { ENABLE_DEV_TOOLS } from 'src/constants';
import { allContextPopulators } from 'src/mocks/context/populators';
import { makeMockContext } from 'src/mocks/mockContext';
import { resolveMockPreset } from 'src/mocks/mockPreset';
import { allMockPresets, defaultBaselineMockPreset } from 'src/mocks/presets';

import { handlers } from '../mocks/serverHandlers';
import {
  getMSWContextPopulators,
  getMSWExtraPresets,
  getMSWPreset,
  isMSWEnabled,
} from './ServiceWorkerTool';

import type { QueryClient } from '@tanstack/react-query';
import type { HttpHandler } from 'msw';
import type {
  MockContext,
  MockContextPopulator,
  MockPreset,
} from 'src/mocks/types';
import type { ApplicationStore } from 'src/store';

let workerInstance: ReturnType<typeof setupWorker> | null = null;

export const getWorker = () => {
  if (!workerInstance) {
    workerInstance = setupWorker(...handlers);
  }
  return workerInstance;
};

export const storybookWorker = getWorker();

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
    const mswPresetId = getMSWPreset() ?? defaultBaselineMockPreset.id;
    const mswPreset =
      allMockPresets.find((preset) => preset.id === mswPresetId) ??
      defaultBaselineMockPreset;

    const extraMswPresetIds = getMSWExtraPresets();
    const extraMswPresets = extraMswPresetIds
      .map((presetId) =>
        allMockPresets.find((extraPreset) => extraPreset.id === presetId)
      )
      .filter((preset): preset is MockPreset => !!preset);

    const mswContentPopulatorIds = getMSWContextPopulators();
    const mswContentPopulators = mswContentPopulatorIds
      .map((populatorId) =>
        allContextPopulators.find((populator) => populator.id === populatorId)
      )
      .filter((populator): populator is MockContextPopulator => !!populator);

    const mockContext = mswContentPopulators.reduce(
      (acc: MockContext, cur: MockContextPopulator) => {
        return cur.populator(acc);
      },
      makeMockContext()
    );

    const extraHandlers = extraMswPresets.reduce<HttpHandler[]>(
      (acc, cur: MockPreset) => {
        return [...resolveMockPreset(cur, mockContext), ...acc];
      },
      []
    );

    const baseHandlers = resolveMockPreset(mswPreset, mockContext);

    // Apply handlers in correct order
    const worker = setupWorker(...extraHandlers, ...baseHandlers);

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

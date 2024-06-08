import { ENABLE_DEV_TOOLS } from 'src/constants';
import { ApplicationStore } from 'src/store';

import { makeMockContext } from 'src/mocks/mockContext';
import { manyLinodesPopulator } from 'src/mocks/context/populators/many-linodes-populator';
import { resolveMockPreset } from 'src/mocks/mockPreset';
import { defaultBaselineMockPreset, allMockPresets } from 'src/mocks/presets';
import { isMSWEnabled, getMSWPreset } from './ServiceWorkerTool';
import { setupWorker } from 'msw/browser';
import { QueryClient } from '@tanstack/react-query';

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

    let mockContext = makeMockContext();
    mockContext = manyLinodesPopulator.populator(mockContext);

    const handlers = resolveMockPreset(mswPreset, mockContext);

    const worker = setupWorker(...handlers);
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  devTools.install(store);
}

/**
 * Defaults to `true` for development
 * Default to `false` in production builds
 *
 * Define `REACT_APP_ENABLE_DEV_TOOLS` to explicitly enable or disable dev tools
 */
export const shouldEnableDevTools =
  ENABLE_DEV_TOOLS !== undefined ? ENABLE_DEV_TOOLS : import.meta.env.DEV;

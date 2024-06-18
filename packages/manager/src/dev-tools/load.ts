import { ENABLE_DEV_TOOLS } from 'src/constants';
import { ApplicationStore } from 'src/store';

import {
  makeMockContext,
  MockContextPopulator,
  MockContext,
} from 'src/mocks/mockContext';
import { resolveMockPreset } from 'src/mocks/mockPreset';
import { defaultBaselineMockPreset, allMockPresets } from 'src/mocks/presets';
import {
  isMSWEnabled,
  getMSWPreset,
  getMSWExtraPresets,
  getMSWContextPopulators,
} from './ServiceWorkerTool';
import { setupWorker } from 'msw/browser';
import { QueryClient } from '@tanstack/react-query';
import { allContextPopulators } from 'src/mocks/context/populators';

import type { MockPreset } from 'src/mocks/mockPreset';

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
      .filter((preset) => !!preset) as MockPreset[];

    const mswContentPopulatorIds = getMSWContextPopulators();
    const mswContentPopulators = mswContentPopulatorIds
      .map((populatorId) =>
        allContextPopulators.find((populator) => populator.id === populatorId)
      )
      .filter((populator) => !!populator) as MockContextPopulator[];

    // Apply MSW context populators.
    const mockContext = mswContentPopulators.reduce(
      (acc: MockContext, cur: MockContextPopulator) => {
        return cur.populator(acc);
      },
      makeMockContext()
    );

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

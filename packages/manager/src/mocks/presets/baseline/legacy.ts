/**
 * @file MSW preset that uses our legacy handlers, for backwards compatibility.
 */

import { handlers } from '../../serverHandlers';

import type { MockPresetBaseline } from 'src/mocks/types';

/**
 * Baseline mock preset that uses our legacy MSW handlers.
 */
export const baselineLegacyPreset: MockPresetBaseline = {
  group: { id: 'General' },
  handlers: [() => handlers],
  id: 'baseline:legacy',
  label: 'Legacy MSW Handlers',
};

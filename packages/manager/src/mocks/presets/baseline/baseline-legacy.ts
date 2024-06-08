/**
 * @file MSW preset that uses our legacy handlers, for backwards compatibility.
 */

import { handlers } from '../../serverHandlers';
import type { MockPreset } from '../../mockPreset';

/**
 * Baseline mock preset that uses our legacy MSW handlers.
 */
export const baselineLegacyPreset: MockPreset = {
  label: 'Legacy MSW Handlers',
  id: 'baseline-legacy',
  group: 'General',
  handlers: [() => handlers],
};

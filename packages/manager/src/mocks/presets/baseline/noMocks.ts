/**
 * @file No mock MSW preset.
 */
import type { MockPresetBaseline } from 'src/mocks/types';

/**
 * Baseline mock preset that does not mock any HTTP requests.
 *
 * Useful in cases where only specific functionality needs to be mocked.
 */
export const baselineNoMocksPreset: MockPresetBaseline = {
  group: { id: 'General' },
  handlers: [],
  id: 'baseline:static-mocking',
  label: 'Static Mocking',
};

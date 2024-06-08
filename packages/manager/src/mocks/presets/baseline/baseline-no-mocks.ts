/**
 * @file No mock MSW preset.
 */
import type { MockPreset } from '../../mockPreset';

/**
 * Baseline mock preset that does not mock any HTTP requests.
 *
 * Useful in cases where only specific functionality needs to be mocked.
 */
export const baselineNoMocksPreset: MockPreset = {
  label: 'No Mocks',
  id: 'baseline-no-mocks',
  group: 'General',
  handlers: [],
};

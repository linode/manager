/**
 * @file No mock MSW preset.
 */
import type { MockPreset } from 'src/mocks/types';

/**
 * Baseline mock preset that does not mock any HTTP requests.
 *
 * Useful in cases where only specific functionality needs to be mocked.
 */
export const baselineNoMocksPreset: MockPreset = {
  group: 'General',
  handlers: [],
  id: 'baseline-no-mocks',
  label: 'No Mocks',
};

import type { Formatter } from './formatter';
import type { RunInfo } from '../results/run-info';

/**
 * Outputs "passing" if all tests have passed, or "failing" if one or more has failed.
 *
 * @param info - Run info.
 */
export const statusFormatter: Formatter = (
  info: RunInfo,
) => {
  return info.passing
    ? 'passing'
    : 'failing';
};

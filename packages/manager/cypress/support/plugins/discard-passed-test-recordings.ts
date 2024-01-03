// @ts-expect-error for some reason, @node/types is v12 and it probably doesn't have this.
import fs from 'fs/promises';

import { CypressPlugin } from './plugin';

/**
 * Delete recordings for any specs that passed without requiring any
 * retries (i.e. only keep recordings for failed and flaky tests) during
 * runs in CI environments.
 *
 * This should save time by avoiding compressing and uploading recordings
 * that we don't need.
 */
export const discardPassedTestRecordings: CypressPlugin = async (
  on,
  config
) => {
  on('after:spec', async (_spec, results) => {
    if (results?.video) {
      const isFailedOrFlaky = results.tests.some((testResult) => {
        return testResult.attempts.some(
          (attempt) => attempt.state === 'failed'
        );
      });

      if (!isFailedOrFlaky && config.env['CI']) {
        await fs.unlink(results.video);
      }
    }
  });
};

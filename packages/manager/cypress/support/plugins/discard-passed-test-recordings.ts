import { CypressPlugin } from './plugin';

// Dependencies used in hooks have to use `require()` syntax.
const fs = require('fs/promises'); // eslint-disable-line

/*
 * Delete recordings for any specs that passed without requiring any
 * retries (ie only keep recordings for failed and flaky tests) during
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

import type { Formatter } from './formatter';
import type { TestResult } from '../results/test-result';
import type { TestSuites } from 'junit2json';
import type { RunInfo } from '../results/run-info';
import type { Metadata } from '../metadata/metadata';
import { pluralize } from '../util/pluralize';
import { secondsToTimeString } from '../util';
import * as path from 'path';
import { cypressRunCommand } from '../util/cypress';
import { escapeHtmlString } from '../util/escape';

/**
 * Outputs test result summary formatted as a GitHub comment.
 *
 * @param info - Run info.
 * @param results - Test results.
 * @param metadata - Run metadata.
 * @param _junitData - Raw JUnit test result data (unused).
 */
export const githubFormatter: Formatter = (
  runInfo: RunInfo,
  results: TestResult[],
  metadata: Metadata,
  _junitData: TestSuites[]
) => {
  const headline = (() => {
    const headingMarkdown = '## ';
    const description = runInfo.failing
      ? `${runInfo.failing} failing ${pluralize(runInfo.failing, 'test', 'tests')} on`
      : `Passing`;

    // If available, render a link for the run.
    const runLink = (metadata.runId && metadata.runUrl)
      ? `[test run #${escapeHtmlString(metadata.runId)} ↗︎](${escapeHtmlString(metadata.runUrl)})`
      : 'test run';

    return `${headingMarkdown}${description} ${runLink}`;
  })();

  const breakdown = `:x: ${runInfo.failing} Failing | :green_heart: ${runInfo.passing} Passing | :arrow_right_hook: ${runInfo.skipped} Skipped | :clock1: ${secondsToTimeString(runInfo.time)}\n\n`;

  const extra = metadata.extra ? `${metadata.extra}\n\n` : null;

  const failedTestSummary = (() => {
    const heading = `### Details`;
    const failedTestHeader = `<table><thead><tr><th colspan="3">Failing Tests</th></tr><tr><th></th><th>Spec</th><th>Test</th></tr></thead><tbody>`;
    const failedTestRows = results
      .filter((result: TestResult) => result.failing)
      .map((result: TestResult) => {
        const specFile = path.basename(result.testFilename);
        return `<tr><td>:x:</td><td><code>${specFile}</code></td><td><em>${result.groupName} » ${result.testName}</em></td></tr>`;
      });
    const failedTestFooter = `</tbody></table>`;

    return [
      heading,
      failedTestHeader,
      ...failedTestRows,
      failedTestFooter,
      '',
    ].join('\n');
  })();

  const rerunNote = (() => {
    const heading = `### Debugging`;
    const failingTestFiles = results
      .filter((result: TestResult) => result.failing)
      .map((result: TestResult) => result.testFilename);

    const rerunTip = 'Use this command to re-run the failing tests:';

    return [
      heading,
      rerunTip,
      '',
      '```bash',
      cypressRunCommand(failingTestFiles),
      '```',
      '',
    ].join('\n');
  })();

  return [
    headline,
    '',
    breakdown,
    extra,
    runInfo.failing > 0 ? failedTestSummary : null,
    runInfo.failing > 0 ? rerunNote : null,
  ]
    .filter((item) => item !== null)
    .join('\n');
};

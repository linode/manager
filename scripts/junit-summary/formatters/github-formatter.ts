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
  const title = !!metadata.pipelineTitle
    ? `## ${metadata.pipelineTitle}`
    : null;

  const headline = (() => {
    const headingMarkdown = '### ';

    const description = runInfo.failing
      ? `:small_red_triangle: ${runInfo.failing} failing ${pluralize(runInfo.failing, 'test', 'tests')} on`
      : `:tada: ${runInfo.passing} passing ${pluralize(runInfo.passing, 'test', 'tests')} on`;

    // If available, render a link for the run.
    const runLink = (metadata.runId && metadata.runUrl)
      ? `[test run #${escapeHtmlString(metadata.runId)} ↗︎](${escapeHtmlString(metadata.runUrl)})`
      : 'test run';

    return `${headingMarkdown}${description} ${runLink}`;
  })();

  const breakdown = [
    '<table>',
    '<thead><tr>',
    '<td><strong>:x: Failing</strong></td>',
    '<td><strong>:white_check_mark: Passing</strong></td>',
    '<td><strong>:arrow_right_hook: Skipped</strong></td>',
    '<td><strong>:clock1: Duration</strong></td>',
    '</tr></thead>',
    '<tbody><tr>',
    `<td><code>${runInfo.failing} Failing</code></td>`,
    `<td><code>${runInfo.passing} Passing</code></td>`,
    `<td><code>${runInfo.skipped} Skipped</code></td>`,
    `<td><code>${secondsToTimeString(runInfo.time)}</code></td>`,
    '</tr></tbody>',
    '</table>',
    '\n\n',
  ].join('');

  const extra = metadata.extra ? `${metadata.extra}\n\n` : null;

  const failedTestSummary = (() => {
    const heading = `#### Details`;
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
    const heading = `#### Troubleshooting`;
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
    title,
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

import type { Formatter } from './formatter';
import type { TestResult } from '../results/test-result';
import type { TestSuites } from 'junit2json';
import type { RunInfo } from '../results/run-info';
import type { Metadata } from '../metadata/metadata';
import { pluralize } from '../util/pluralize';
import { secondsToTimeString } from '../util';
import * as path from 'path';
import { cypressRunCommand } from '../util/cypress';

/**
 * Outputs test result summary formatted as a Slack message.
 *
 * @param info - Run info.
 * @param results - Test results.
 * @param metadata - Run metadata.
 * @param _junitData - Raw JUnit test result data (unused).
 */
export const slackFormatter: Formatter = (
  runInfo: RunInfo,
  results: TestResult[],
  metadata: Metadata,
  _junitData: TestSuites[]
) => {
  const indicator = runInfo.failing ? ':x-mark:' : ':check-mark:';
  const headline = (metadata.runId && metadata.runUrl)
    ? `*Cypress test results for run <${metadata.runUrl}|#${metadata.runId}>*\n`
    : `*Cypress test results*\n`;

  const breakdown = `:small_red_triangle: ${runInfo.failing} Failing | :thumbs_up_green: ${runInfo.passing} Passing | :small_blue_diamond: ${runInfo.skipped} Skipped\n\n`;

  // Show a human-readable summary of what was tested and whether it succeeded.
  const summary = (() => {
    const info = !runInfo.failing
     ? `> ${indicator} ${runInfo.passing} passing ${pluralize(runInfo.passing, 'test', 'tests')}`
     : `> ${indicator} ${runInfo.failing} failed ${pluralize(runInfo.failing, 'test', 'tests')}`;

    const prInfo = (metadata.changeId && metadata.changeUrl)
      ? ` on PR <${metadata.changeUrl}|#${metadata.changeId}>${metadata.changeTitle ? ` - _${metadata.changeTitle}_` : ''}`
      : '';

    const runLength = `(${secondsToTimeString(runInfo.time)})`;
    const endingPunctuation = !runInfo.failing ? '.' : ':';

    return `${info}${prInfo} ${runLength}${endingPunctuation}`
  })();

  // Display a list of failed tests and collection of actions when applicable.
  const failedTestSummary = (() => {
    const failedTestLines = results
      .filter((result: TestResult) => result.failing)
      .map((result: TestResult) => {
        const specFile = path.basename(result.testFilename);
        return `• \`${specFile}\` — _${result.groupName}_ » _${result.testName}_`;
      });

    // When applicable, display actions that can be taken by the user.
    const failedTestActions = [
      metadata.resultsUrl ? `<${metadata.resultsUrl}|View results>` : '',
      metadata.artifactsUrl ? `<${metadata.artifactsUrl}|View artifacts>` : '',
      metadata.rerunUrl ? `<${metadata.rerunUrl}|Replay tests>` : '',
    ]
      .filter((item) => item !== '')
      .join(' | ');

    return [
      '',
      ...failedTestLines,
      '',
      failedTestActions ? failedTestActions : null,
    ]
      .filter((item) => item !== null)
      .map((item) => `> ${item}`)
      .join('\n');
  })();

  // Display re-run command to help with troubleshooting.
  const rerunNote = (() => {
    const failingTestFiles = results
      .filter((result: TestResult) => result.failing)
      .map((result: TestResult) => result.testFilename);

    const rerunTip = 'Use this command to re-run the failing tests:';
    const cypressCommand = `${'```'}${cypressRunCommand(failingTestFiles)}${'```'}`;

    return `${rerunTip}\n${cypressCommand}`;
  })();

  // Display test run details (author, PR number, run number, etc.) when applicable.
  const footer = (() => {
    const authorIdentifier = (metadata.authorSlack ? `@${metadata.authorSlack}` : null)
      || (metadata.authorGitHub ? `<https://github.com/${metadata.authorGitHub}|${metadata.authorGitHub}>` : null)
      || (metadata.authorName ? metadata.authorName : null);

    return [
      authorIdentifier ? `Authored by ${authorIdentifier}` : null,
      metadata.changeId && metadata.changeUrl ? `PR <${metadata.changeUrl}|#${metadata.changeId}>` : null,
      metadata.runId && metadata.runUrl ? `Run <${metadata.runUrl}|#${metadata.runId}>` : null,
      metadata.branchName ? `\`${metadata.branchName}\`` : null,
    ]
    .filter((item) => item !== null)
    .join(' | ');
  })();

  return [
    headline,
    breakdown,
    summary,

    // Add an extra line after the summary when no failures are listed.
    runInfo.failing > 0 ? null : '',

    // When one or more test has failed, display the list of failed tests as
    // well as a command that can be used to re-run failed tests locally.
    runInfo.failing > 0 ? `${failedTestSummary}\n` : null,
    runInfo.failing > 0 ? `${rerunNote}\n` : null,

    // Show run details footer.
    `:cypress: ${footer}`,
  ].filter((item) => item !== null).join('\n');
};

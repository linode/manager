/**
 * @file Script to generate test result summaries from JUnit reports.
 */

import type { TestSuite, TestSuites } from 'junit2json';
import type { Formatter } from './formatters/formatter';
import type { Metadata } from './metadata/metadata';
import type { TestResult } from './results/test-result';

import { program } from 'commander';
import * as fs from 'fs/promises';
import { parse } from 'junit2json';
import * as path from 'path';
import { githubFormatter } from './formatters/github-formatter';
import { jsonFormatter } from './formatters/json-formatter';
import { slackFormatter } from './formatters/slack-formatter';
import { statusFormatter } from './formatters/status-formatter';
import { RunInfo } from './results/run-info';
import { getSkippedTestCount, getTestLength, getTestResults } from './util';

program
  .name('junit-summary')
  .description('Outputs test result summary from JUnit reports')
  .version('0.1.0')
  .arguments('<junitPath>')
  .option('-f, --format <str>', 'JUnit summary output format', 'json')
  .option('--meta:author-name <str>', 'Author name')
  .option('--meta:author-slack <str>', 'Author Slack name')
  .option('--meta:author-github <str>', 'Author GitHub name')
  .option('--meta:change-id <num>', 'Change PR number')
  .option('--meta:change-url <str>', 'Change PR URL')
  .option('--meta:change-title <str>', 'Change PR title')
  .option('--meta:branch <str>', 'Branch name')
  .option('--meta:run-id <str>', 'CI run ID')
  .option('--meta:run-url <str>', 'CI run URL')
  .option('--meta:artifacts-url <str>', 'CI artifacts URL')
  .option('--meta:results-url <str>', 'CI results URL')
  .option('--meta:rerun-url <str>', 'CI rerun URL')
  .action((junitPath) => {
    return main(junitPath);
  });

const isTestSuites = (data: TestSuite | TestSuites): data is TestSuites => {
  return !!(data as TestSuites).testsuite && !(data as TestSuite).testcase;
};

const main = async (junitPath: string) => {
  try {
    const reportPath = path.resolve(junitPath);
    const summaryFormat = program.opts().format;
    const metadata: Metadata = {
      authorName: program.opts()['meta:authorName'],
      authorSlack: program.opts()['meta:authorSlack'],
      authorGitHub: program.opts()['meta:auhtorGithub'],

      changeId: program.opts()['meta:changeId'],
      changeUrl: program.opts()['meta:changeUrl'],
      changeTitle: program.opts()['meta:changeTitle'],

      branchName: program.opts()['meta:branch'],

      runId: program.opts()['meta:runId'],
      runUrl: program.opts()['meta:runUrl'],

      artifactsUrl: program.opts()['meta:artifactsUrl'],
      resultsUrl: program.opts()['meta:resultsUrl'],
      rerunUrl: program.opts()['meta:rerunUrl'],
    };

    // Create an array of absolute file paths to JUnit XML report files.
    const reportFiles = (await fs.readdir(reportPath))
      .filter((dirItem: string) => {
        return dirItem.endsWith('.xml')
      })
      .map((dirItem: string) => {
        return path.resolve(reportPath, dirItem);
      });

    if (reportFiles.length < 1) {
      throw new Error(`No JUnit report files found in '${reportPath}'.`)
    }

    // Read JUnit report file contents.
    const loadReportFileContents = reportFiles.map((reportFile: string) => {
      return fs.readFile(reportFile, 'utf8');
    });

    const junitContents = await Promise.all(loadReportFileContents);
    const parseJunitReports = junitContents.map((contents: string) => parse(contents));
    const reportData = await Promise.all(parseJunitReports);

    if (!reportData) {
      throw new Error('Failed to parse JUnit report data');
    }

    const testSuites: TestSuites[] = reportData.reduce((acc: TestSuites[], cur) => {
      if (!!cur && isTestSuites(cur)) {
        acc.push(cur);
      }
      return acc;
    }, []);

    const results = testSuites.reduce((acc: TestResult[], cur: TestSuites) => {
      acc.push(...getTestResults(cur));
      return acc;
    }, []);

    const failingTests = results.filter((result) => result.failing);
    const passingTests = results.filter((result) => result.passing);
    const skippedTests = getSkippedTestCount(testSuites);

    const info: RunInfo = {
      rootSuite: 'Root suite name',
      testSuite: 'Test suite name',
      time: getTestLength(testSuites),
      tests: results.length + skippedTests,
      failing: failingTests.length,
      passing: passingTests.length,
      skipped: skippedTests,
    };

    const formatter: Formatter = (() => {
      switch (summaryFormat.toLowerCase()) {
      case 'json':
        return jsonFormatter;

      case 'slack':
        return slackFormatter;

      case 'github':
        return githubFormatter;

      case 'status':
        return statusFormatter;

      default:
        throw new Error(`Unknown formatter '${summaryFormat}'.`);
      }
    })();

    console.log(formatter(info, results, metadata, testSuites));
  }
  catch (e: any) {
    console.error('A fatal error has occurred while summarizing test results');
    if (e.message) {
      console.info(e.message);
    }
    process.exit(1);
  }
};

program.parse(process.argv);

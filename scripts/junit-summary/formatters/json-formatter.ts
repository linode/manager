import type { Formatter } from './formatter';
import type { TestResult } from '../results/test-result';
import type { TestSuite, TestSuites } from 'junit2json';
import type { RunInfo } from '../results/run-info';
import type { Metadata } from '../metadata/metadata';


/**
 * Outputs test result data in JSON format.
 *
 * @param info - Run info.
 * @param results - Test results.
 * @param metadata - Run metadata.
 * @param _junitData - Raw JUnit test result data (unused).
 */
export const jsonFormatter: Formatter = (
  info: RunInfo,
  results: TestResult[],
  metadata: Metadata,
  _junitData: TestSuites[]
) => {
  return JSON.stringify({
    info,
    metadata,
    results,
  });
};

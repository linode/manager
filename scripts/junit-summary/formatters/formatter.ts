import type { TestSuites } from 'junit2json';
import type { RunInfo } from '../results/run-info';
import type { TestResult } from '../results/test-result';
import type { Metadata } from '../metadata/metadata';

/**
 * A function that outputs a test result summary in some format.
 */
export type Formatter = (
  /** Test run information. */
  runInfo: RunInfo,

  /** Test results. */
  results: TestResult[],

  /** Additional test run metadata. */
  metadata: Metadata,

  /** Raw JUnit test result data. */
  junitData: TestSuites[]
) => string;

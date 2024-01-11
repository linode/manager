/**
 * Describes a test run.
 */
export interface RunInfo {
  /** Root test suite name. */
  rootSuite: string;

  /** Test suite name. */
  testSuite: string;

  /** Total number of tests. */
  tests: number;

  /** Test run duration in seconds. */
  time: number;

  /** Number of failing tests. */
  failing: number;

  /** Number of passing tests. */
  passing: number;

  /** Number of skipped tests. */
  skipped: number;
};

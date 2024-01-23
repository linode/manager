/**
 * Describes an individual test result.
 */
export interface TestResult {
  /** Test spec filename. */
  testFilename: string;

  /** Test group name. */
  groupName: string;

  /** Test name. */
  testName: string;

  /** Whether test is passing. */
  passing: boolean;

  /** Whether test is failing. */
  failing: boolean;
};

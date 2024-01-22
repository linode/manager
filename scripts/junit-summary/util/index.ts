import type { TestSuite, TestSuites, TestCase } from 'junit2json';
import type { TestResult } from '../results/test-result';

/**
 * Returns the total length of time for each test suite to run in seconds.
 *
 * @param suites - Array of test suites.
 *
 * @returns Length of time for all suites to run, in seconds.
 */
export const getTestLength = (suites: TestSuites[]): number => {
  const unroundedLength = suites.reduce((acc: number, cur: TestSuites) => {
    return acc + (cur.time ?? 0);
  }, 0);
  return Math.round(unroundedLength * 1000) / 1000;
};

/**
 * Returns the number of skipped tests in the array of `TestSuites` instances.
 *
 * @param suites - Test suites array.
 *
 * @return Number of skipped tests in `suites`.
 */
export const getSkippedTestCount = (suites: TestSuites[]): number => {
  return suites.reduce((acc: number, cur: TestSuites) => {
    if (cur.testsuite) {
      const skippedTests = cur.testsuite.reduce((skipped: number, currentSuite: TestSuite) => {
        if (currentSuite.tests && currentSuite.testcase) {
          return skipped + (currentSuite.tests - currentSuite.testcase.length);
        }
        return skipped;
      }, 0);
      return acc + skippedTests;
    }
    return acc;
  }, 0);
}

export const getTestResults = (suite: TestSuites): TestResult[] => {
  if (!suite.testsuite) {
    return [];
  }
  // The first item in the array contains the 'file' property which refers to
  // the individual spec file.
  const initialSuite = suite.testsuite[0];

  // I'm so sorry.
  const filepath = ((initialSuite as any)['file'] as string);

  const results = suite.testsuite.reduce((acc: TestResult[], cur: TestSuite) => {
    if (cur.tests && cur.testcase) {
      const suitename = cur.name;
      const testcases = cur.testcase;

      const results = testcases.map((testCase: TestCase): TestResult => {
        return {
          testFilename: filepath,
          groupName: suitename || '',
          testName: testCase.classname || '',
          passing: !testCase.failure,
          failing: !!testCase.failure,
        };
      });

      acc.push(...results);
    }
    return acc;
  }, []);
  return results;
};

/**
 * Returns a string describing the length of time in more human-readable format.
 *
 * @param seconds - Number of seconds.
 *
 * @returns String describing length of time.
 */
export const secondsToTimeString = (seconds: number) => {
  if (seconds <= 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds/60);
  const remainingSeconds = Math.floor(seconds - (minutes * 60));

  return `${minutes}m ${remainingSeconds}s`;
};

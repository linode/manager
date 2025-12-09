/**
 * Generates a Cypress run command to run the given test files.
 *
 * @param testFiles - Array of test filepaths.
 *
 * @returns Cypress run command to run `testFiles`.
 */
export const cypressRunCommand = (testFiles: string[]): string => {
  const dedupedTestFiles = Array.from(new Set(testFiles));
  const testFilesList = dedupedTestFiles.join(',');
  return `pnpm cy:run -s "${testFilesList}"`;
};

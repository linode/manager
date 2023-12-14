/**
 * Generates a Cypress run command to run the given test files.
 *
 * @param testFiles - Array of test filepaths.
 *
 * @returns Cypress run command to run `testFiles`.
 */
export const cypressRunCommand = (testFiles: string[]): string => {
  const testFilesList = testFiles.join(',');
  return `yarn cy:run -s "${testFilesList}`;
};

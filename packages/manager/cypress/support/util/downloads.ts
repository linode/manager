// Path to Cypress downloads folder.
const downloadsPath = Cypress.config('downloadsFolder');

/**
 * Returns the path to the downloaded file with the given filename.
 *
 * @param filename - Filename of downloaded file for which to get path.
 *
 * @returns Path to download with the given filename.
 */
export const getDownloadFilepath = (filename: string) => {
  return `${downloadsPath}/${filename}`;
};

/**
 * Reads a downloaded file with the given filename.
 *
 * @param filename - Filename of downloaded file to read.
 *
 * @returns Cypress chainable.
 */
export const readDownload = (filename: string) => {
  return cy.readFile(getDownloadFilepath(filename));
};

/**
 * Deletes all downloaded files under the download directory.
 *
 *
 * @returns Cypress chainable.
 */
export const cleanUpDownloadFiles = () => {
  return cy.task('cleanUpFolder', downloadsPath);
};

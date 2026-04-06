/**
 * Generates the changelog content with the provided release date and version.
 * @param {string} releaseDate - The release date in YYYY-MM-DD format.
 * @param {string} semver - The release version.
 * @returns {string[]} The array of lines for the initial changelog content (date & semver).
 */
export const initiateChangelogEntry = (releaseDate, semver) => {
  const changelogContent = [];

  changelogContent.push(`## [${releaseDate}] - v${semver}\n`);

  return changelogContent;
};

import { logger } from './logger.mjs';

/**
 * Increments the version of a semantic version string.
 * @param {string} version - The current version.
 * @returns {string} The new version with the incremented semver version.
 * @note This is will NOT increment the package.json version. Just the changelog version.
 */
export const incrementSemver = (currentVersion, semver) => {
  try {
    const parts = currentVersion.split('.');
    const [major, minor, patch] = parts.map((part) => parseInt(part, 10));

    let updatedMajor = major;
    let updatedMinor = minor;
    let updatedPatch = patch;

    if (semver === 'patch') {
      updatedPatch += 1;
    } else if (semver === 'minor') {
      updatedMinor += 1;
      updatedPatch = 0;
    } else if (semver === 'major') {
      updatedMajor += 1;
      updatedMinor = 0;
      updatedPatch = 0;
    } else {
      throw new Error('Invalid semver argument');
    }

    const updatedParts = [updatedMajor, updatedMinor, updatedPatch];
    return updatedParts.join('.');
  } catch (error) {
    logger.error({
      message: 'Error: Could not increment semver.',
      info: error,
    });
    return currentVersion;
  }
};

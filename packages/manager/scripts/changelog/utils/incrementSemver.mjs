import { logger } from './logger.mjs';

/**
 * Increments the version of a semantic version string.
 * @param {string} version - The current version.
 * @returns {string} The new version with the incremented semver version.
 * @note This is will NOT increment the package.json version. Just the changelog version.
 */
export const incrementSemver = (currentVersion, semver) => {
  const parts = currentVersion.split('.');

  try {
    const patchVersion = parseInt(parts[2], 10);
    const minorVersion = parseInt(parts[1], 10);
    const majorVersion = parseInt(parts[0], 10);

    if (semver === 'patch') {
      parts[2] = (patchVersion + 1).toString();
    } else if (semver === 'minor') {
      parts[2] = '0';
      parts[1] = (minorVersion + 1).toString();
    } else if (semver === 'major') {
      parts[2] = '0';
      parts[1] = '0';
      parts[0] = (majorVersion + 1).toString();
    } else {
      throw new Error('Invalid semver argument');
    }
  } catch (error) {
    logger.error({
      message: 'Error: Could not increment semver.',
      info: error,
    });
  }

  return parts.join('.');
};

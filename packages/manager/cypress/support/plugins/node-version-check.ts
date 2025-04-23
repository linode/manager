import { CypressPlugin } from './plugin';

// Supported major versions of Node.js.
// Running Cypress using other versions will cause a warning to be displayed.
const supportedVersions = [18, 20];

/**
 * Returns a string describing the version of Node.js that is running the tests.
 *
 * @example
 * getVersionString(); // '18.14.1'.
 *
 * @returns String describing Node.js version.
 */
const getVersionString = () => {
  return process.version.substring(1, process.version.length);
};

/**
 * Returns an object describing each component of a version string.
 *
 * @returns Object describing a version string.
 */
const getVersionComponents = (versionString: string) => {
  const versionComponentsArray = versionString
    .split('.')
    .map((str) => parseInt(str, 10));

  return {
    full: versionString,
    major: versionComponentsArray[0],
    minor: versionComponentsArray[1],
    patch: versionComponentsArray[2],
  };
};

/**
 * Displays a warning if tests are running on an unsupported version of Node JS.
 */
export const nodeVersionCheck: CypressPlugin = (_on, _config): void => {
  const version = getVersionComponents(getVersionString());

  if (!supportedVersions.includes(version.major)) {
    console.warn(
      `You are running Node v${version.full}. Only the following versions of Node are supported:`
    );
    supportedVersions.forEach((supportedVersion) => {
      console.warn(`  - v${supportedVersion}.x`);
    });
  }
};

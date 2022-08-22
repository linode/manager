// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

const path = require('path');

/**
 * Loads environment variables from `.env` file.
 *
 * Environment variables are inserted into Cypress's config object under the
 * `env` key.
 */
function getConfiguration() {
  const dotenvPath = path.resolve(__dirname, '../../.env');
  const conf = require('dotenv').config({
    path: dotenvPath,
  });
  if (conf.error) {
    throw Error(
      `Could not load .env from Cypress plugin/index.js: ${conf.error}`
    );
  }

  const env = {
    ...conf.parsed,
    ...process.env,
  };

  return { env };
}

/**
 * Checks if a recommended version of Node is being used to run these tests.
 *
 * If a version of Node other than a recommended version is being used, a
 * warning is logged.
 */
function checkNodeVersionRequiredByLinode() {
  // Versions of Node.js that are recommended for these tests.
  const recommendedNodeVersions = [14];

  const versionString = process.version.substr(1, process.version.length - 1);
  const versionComponents = versionString
    .split('.')
    .map((versionComponentString) => {
      return parseInt(versionComponentString, 10);
    });

  // Print warning if running a version of Node that is not recommended.
  if (!recommendedNodeVersions.includes(versionComponents[0])) {
    if (recommendedNodeVersions.length > 1) {
      console.warn(
        `You are currently running Node v${versionString}. We recommend one of the following versions of Node for these tests:\n`
      );
      console.warn(
        `${recommendedNodeVersions
          .map((version) => `  - v${version}.x\n`)
          .join('')}`
      );
    } else {
      console.warn(
        `You are currently running Node v${versionString}. We recommend Node v${recommendedNodeVersions[0]}.x for these tests.`
      );
    }
  }
}

module.exports = (on, _config) => {
  checkNodeVersionRequiredByLinode();

  on('task', {
    datenow() {
      return Date.now();
    },
  });

  return getConfiguration();
};

// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const path = require('path');

// loading config object to append to cypress
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
  return { env: conf.parsed };
}

const registerVisualRegTasks = require('./visualRegPlugin');
function checkNodeVersionRequiredByLinode() {
  const v = process.version.substr(1, process.version.length - 1).split('.');
  if (![12, 10].includes(v[0])) {
    console.error('We recomend Node version 10 or 12 to run this tests');
  }
}

module.exports = (on, _config) => {
  registerVisualRegTasks(on);
  checkNodeVersionRequiredByLinode();

  on('task', {
    datenow() {
      return Date.now();
    },
  });

  return getConfiguration();
};

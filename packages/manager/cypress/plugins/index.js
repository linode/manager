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
const fs = require('fs-extra');
const path = require('path');

function getConfigurationByFile(file) {
  const pathToConfigFile = path.resolve('../manager', 'config', `${file}.json`);

  return fs.readJson(pathToConfigFile);
}

function checkNodeVersionRequiredByLinode(){
  const v = process.version.substr(1, process.version.length-1).split('.');
  if (![12,10].includes(v[0])){
    console.error("We recomend Node version 10 or 12 to run this tests");
  }
}

module.exports = (on, config) => {
  checkNodeVersionRequiredByLinode();


  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  // accept a configFile value or use development by default

  on('task', {
    datenow() {
      return Date.now();
    }
  });

  const file = config.env.configFile || 'development';

  return getConfigurationByFile(file);
};

const { keysIn } = require('lodash');
const { merge } = require('ramda');
const { argv } = require('yargs');
const wdioMaster = require('./wdio.conf.js');
const { browserConf } = require('./browser-config');

// TODO - update to use credstore interface for login instead of config-utils
const {
    login
} = require('../utils/config-utils');

const { browserCommands } = require('./custom-commands');

const selectedBrowser = () => {
    if (argv.browser) {
        return browserConf[argv.browser];
    }
    if (process.env.DOCKER || argv.debug) {
     return browserConf['chrome'];
    }
    return browserConf['headlessChrome'];
}

const seleniumSettings = require('./selenium-config');
const servicesToStart = process.env.DOCKER ? [] : ['selenium-standalone'];

exports.config = merge(wdioMaster.config, {
    specs: ['./e2e/specs/accessibility/*.spec.js'],
    exclude: [
    ],
    capabilities: [selectedBrowser()],
    maxInstances: process.env.DOCKER || argv.debug ?  1 : 4,
    services: servicesToStart,
    seleniumInstallArgs: seleniumSettings,
    seleniumArgs: seleniumSettings,
    onPrepare: () => {},
    before: function(caps, specs) {
        // Load up our custom commands
        require('babel-register');
        browserCommands();

        login(process.env.MANAGER_USER, process.env.MANAGER_PASS, false);
    },
    after: () => {},
    onComplete: () => {},
});

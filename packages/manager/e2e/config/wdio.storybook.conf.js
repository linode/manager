const { merge } = require('ramda');
const { argv } = require('yargs');
const { browserCommands } = require('./custom-commands');
const wdioMaster = require('./wdio.conf.js');
const { constants } = require('../constants');
const { browserConf } = require('./browser-config');
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
const specsToRun = argv.story ? [ `./src/components/${argv.story}/${argv.story}.spec.js` ] : ['./src/components/**/*.spec.js'];
const servicesToStart = process.env.DOCKER || argv.debug ? [] : ['selenium-standalone'];

exports.config = merge(wdioMaster.config, {
    specs: specsToRun,
    baseUrl: process.env.DOCKER ? 'http://manager-storybook:6006' : 'http://localhost:6006',
    capabilities: [selectedBrowser()],
    maxInstances: process.env.DOCKER || argv.debug ?  1 : 4,
    reporterOptions: {
        junit: {
            outputDir: './storybook-test-results'
        }
    },
    services: servicesToStart,
    seleniumInstallArgs: seleniumSettings,
    seleniumArgs: seleniumSettings,
    onPrepare: function(config, capabilities, user) {
    },
    before: function (capabilities, specs) {
        browserCommands();
    },
    beforeSuite: function(suite) {
    },
    after: function (result, capabilities, specs) {
    },
    onComplete: function(exitCode, config, capabilities) {
    }
});

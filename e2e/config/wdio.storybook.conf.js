const { merge } = require('ramda');
const { argv } = require('yargs');
const { browserCommands } = require('./custom-commands');
const wdioMaster = require('./wdio.conf.js');
const { constants } = require('../constants');
const { browserConf } = require('./browser-config');
const selectedBrowser = () => {
    if (argv.b) {
        return browserConf[argv.b];
    }
    if (process.env.DOCKER || argv.debug) {
     browserConf['chrome'];
    }
    return browserConf['headlessChrome'];
}
const specsToRun = argv.file ? [ argv.file ] : ['./src/components/**/*.spec.js'];
const servicesToStart = process.env.DOCKER || argv.debug ? [] : ['selenium-standalone'];

exports.config = merge(wdioMaster.config, {
    specs: specsToRun,
    baseUrl: process.env.DOCKER ? 'http://manager-storybook:6006' : 'http://localhost:6006',
    capabilities: [selectedBrowser()],
    maxInstances: process.env.DOCKER ? 1 : 4,
    reporterOptions: {
        junit: {
            outputDir: './storybook-test-results'
        }
    },
    services: servicesToStart,
    seleniumInstallArgs: { config: './selenium-config.js' },
    seleniumArgs: { config: './selenium-config.js' },
    before: function (capabilities, specs) {
        browserCommands();
        browser.url(constants.routes.storybook);
    },
    beforeSuite: function(suite) {
        // Do nothing before suites
    }
});

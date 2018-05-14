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
     return browserConf['chrome'];
    }
    return browserConf['headlessChrome'];
}

const seleniumSettings = require('./selenium-config');
const specsToRun = argv.file ? [ argv.file ] : ['./src/components/**/*.spec.js'];
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
    before: function (capabilities, specs) {
        browserCommands();
        browser.url(constants.routes.storybook);

        // Collapse first story
        browser.waitUntil(function() {
            return $$('[data-name]').length > 0;
        }, 5000, 'Stories not displaying. Is storybook running?');
        const defaultChildStories = $$('[data-name]')[0].$('[data-name]');
        $$('[data-name]')[0].click();
        defaultChildStories.waitForVisible(3000, true);
    },
    beforeSuite: function(suite) {
        // Do nothing before suites
    }
});

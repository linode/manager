const { merge } = require('ramda');
const { argv } = require('yargs');
const { browserCommands } = require('./custom-commands');
const wdioMaster = require('./wdio.conf.js');
const { constants } = require('../constants');
const specsToRun = argv.file ? [ argv.file ] : ['./src/components/**/*.spec.js'];

exports.config = merge(wdioMaster.config, {
    specs: specsToRun,
    baseUrl: process.env.DOCKER ? 'http://manager-storybook:6006' : 'http://localhost:6006',
    maxInstances: process.env.DOCKER ? 1 : 3,
    reporterOptions: {
        junit: {
            outputDir: './storybook-test-results'
        }
    },
    before: function (capabilities, specs) {
        browserCommands();
        browser.url(constants.routes.storybook);
    },
    beforeSuite: function(suite) {
        // Do nothing before suites
    }
});

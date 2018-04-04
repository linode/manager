const { merge } = require('ramda');
const { argv } = require('yargs');
const { browserCommands } = require('./custom-commands');
const wdioMaster = require('./wdio.conf.js');
const specsToRun = argv.file ? [ argv.file ] : ['./src/components/**/*.spec.js'];

exports.config = merge(wdioMaster.config, {
    specs: specsToRun,
    baseUrl: process.env.DOCKER ? 'http://manager-storybook:6006' : 'http://localhost:6006',
    maxInstances: 3,
    before: function (capabilities, specs) {
        browserCommands();
    },
    beforeSuite: function(suite) {
        // Do nothing before suites
    }
});

const { merge } = require('ramda');
const { browserCommands } = require('./custom-commands');
const wdioMaster = require('./wdio.conf.js');

exports.config = merge(wdioMaster.config, {
    specs: ['./src/components/**/*.spec.js'],
    baseUrl: process.env.DOCKER ? 'https://manager-storybook:6006' : 'http://localhost:6006',
    before: function (capabilities, specs) {
        browserCommands();
    },
    beforeSuite: function(suite) {
        // Do nothing before suites
    }

});
require('dotenv').config();

const { merge } = require('ramda');
const { argv } = require('yargs');
const { constants } = require('../constants');
const { browserConf } = require('./browser-config');

const wdioMaster = require('./wdio.conf.js');
const selectedBrowser = argv.browser ? browserConf[argv.browser] : browserConf['chrome'];
const seleniumSettings = require('./selenium-config');

const username = process.env.MANAGER_USER;
const password = process.env.MANAGER_PASS;

selectedBrowser['browserstack.local'] = true;

exports.config = merge(wdioMaster.config, {
    host: 'hub.browserstack.com',
    services: ['browserstack'],
    capabilities: [selectedBrowser],
    user: process.env.BROWSERSTACK_USERNAME,
    key: process.env.BROWSERSTACK_ACCESS_KEY,
    browserstackLocal: true,
});

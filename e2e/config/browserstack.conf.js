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

exports.config = merge(wdioMaster.config, {
    host: 'hub.browserstack.com',
    services: ['browserstack'],
    capabilities: [{
        browserName: 'chrome',
        'browserstack.local': true,
        acceptSslCerts: true,
        acceptInsecureCerts: true,
        chromeOptions: {
            args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1600,1080',
            ]
        }
    }],
    user: process.env.BROWSERSTACK_USERNAME,
    key: process.env.BROWSERSTACK_ACCESS_KEY,
    browserstackLocal: true,
});

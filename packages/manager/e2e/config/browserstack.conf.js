require('dotenv').config();

const { merge } = require('ramda');
const { argv } = require('yargs');
const { browserConf } = require('./browser-config');
const { constants } = require('../constants');

const wdioMaster = require('./wdio.conf.js');
const selectedBrowser = argv.browser
  ? browserConf[argv.browser]
  : browserConf['chrome'];
// Enable When browserstack support Selenium 3.13.0
// const seleniumSettings = require('./selenium-config');

const username = process.env.MANAGER_USER;
const password = process.env.MANAGER_PASS;

if (argv.local) {
  selectedBrowser['browserstack.local'] = true;
} else {
  selectedBrowser['browserstack.local'] = false;
}

// Enable When browserstack support Selenium 3.13.0
//selectedBrowser['browserstack.selenium_version'] = seleniumSettings.version;
selectedBrowser['browserstack.selenium_version'] = '3.11.0';

exports.config = merge(wdioMaster.config, {
  host: 'hub.browserstack.com',
  services: ['browserstack'],
  capabilities: [selectedBrowser],
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,
  browserstackLocal: argv.local ? true : false,
  browserstackLocalForcedStop: true,
  waitforTimeout: 25000
});

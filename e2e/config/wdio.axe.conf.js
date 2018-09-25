const { merge } = require('ramda');
const { argv } = require('yargs');
const wdioMaster = require('./wdio.conf.js');
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
const servicesToStart = process.env.DOCKER ? [] : ['selenium-standalone'];

exports.config = merge(wdioMaster.config, {
    specs: ['./e2e/setup/setup.spec.js', './e2e/specs/accessibility/*.spec.js'],
    capabilities: [selectedBrowser()],
    maxInstances: process.env.DOCKER || argv.debug ?  1 : 4,
    services: servicesToStart,
    seleniumInstallArgs: seleniumSettings,
    seleniumArgs: seleniumSettings,
});

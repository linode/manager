require('dotenv').config();

const { readFileSync, unlinkSync } = require('fs');
const { argv } = require('yargs');

const FSCredStore = require('../utils/fs-cred-store');
const MongoCredStore = require('../utils/mongo-cred-store');

const { browserCommands } = require('./custom-commands');
const { browserConf } = require('./browser-config');
const { keysIn } = require('lodash');
const selectedBrowser = argv.browser
  ? browserConf[argv.browser]
  : browserConf['chrome'];

const specsToRun = () => {
  if (argv.vscode) {
    return [`${argv.file}`];
  }

  if (argv.file) {
    return [`./e2e/specs/${argv.file}`];
  }

  if (argv.spec) {
    return argv.spec.split(',');
  }

  if (argv.dir || argv.d) {
    return [`./e2e/specs/${argv.dir || argv.d}/**/*.spec.js`];
  }

  if (argv.smoke) {
    return ['./e2e/specs/**/smoke-*spec.js'];
  }

  return ['./e2e/specs/**/*.js'];
};

const specs = specsToRun();

const selectedReporters = argv.log ? ['spec', 'junit'] : ['spec'];

const getRunnerCount = () => {
  const userCount = keysIn(process.env).filter(users =>
    users.includes('MANAGER_USER')
  ).length;
  const specsCount = specs.length;
  const isSuite = specs[0].includes('**');
  const isParallelRunner = (isSuite || specsCount > 1) && userCount > 1;
  return isParallelRunner ? userCount : 1;
};

const parallelRunners = getRunnerCount();

// NOTE: credStore provides a promise-based API.  In order to work correctly with WDIO, any calls in
// lifecycle methods *other than* onPrepare and onComplete should be wrapped using WDIO's browser.call
// method.  This blocks execution until any promises within the function passed to call are resolved.
// See more at:
//   https://webdriver.io/docs/api/browser/call.html
//
const credStores = {
  fs: new FSCredStore('./e2e/creds.js'),
  mongodb: new MongoCredStore('mongodb'),
  mongolocal: new MongoCredStore('localhost')
};

let CRED_STORE_MODE = process.env.CRED_STORE_MODE
  ? process.env.CRED_STORE_MODE
  : 'fs';

if (!(CRED_STORE_MODE in credStores)) {
  let msg = 'CRED_STORE_MODE must be one of: ';
  for (cs in credStores) {
    msg += cs + ' ';
  }
  throw new Error(msg);
}
const credStore = credStores[CRED_STORE_MODE];

let creds = null;

exports.config = {
  // TODO fix this for debugging with VSCode and not affecting Travis builds
  // debug: true,
  // execArgv: ['--inspect=127.0.0.1:5859'],
  // Selenium Host/Port
  hostname: process.env.DOCKER ? 'selenium' : 'localhost',
  port: 4444,
  //
  // ==================
  // Specify Test Files
  // ==================
  // Define which test specs should run. The pattern is relative to the directory
  // from which `wdio` was called. Notice that, if you are calling `wdio` from an
  // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
  // directory is where your package.json resides, so `wdio` will be called from there.
  //
  specs: specs,
  // Patterns to exclude.
  exclude: [
    './e2e/specs/accessibility/*.spec.js'
    // 'path/to/excluded/files'
  ],
  //
  // ============
  // Capabilities
  // ============
  // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
  // time. Depending on the number of capabilities, WebdriverIO launches several test
  // sessions. Within your capabilities you can overwrite the spec and exclude options in
  // order to group specific specs to a specific capability.
  //
  // First, you can define how many instances should be started at the same time. Let's
  // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
  // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
  // files and you set maxInstances to 10, all spec files will get tested at the same time
  // and 30 processes will get spawned. The property handles how many capabilities
  // from the same test should run tests.
  //
  maxInstances: parallelRunners,
  //
  // If you have trouble getting all important capabilities together, check out the
  // Sauce Labs platform configurator - a great tool to configure your capabilities:
  // https://docs.saucelabs.com/reference/platforms-configurator
  //
  capabilities: [selectedBrowser],
  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // By default WebdriverIO commands are executed in a synchronous way using
  // the wdio-sync package. If you still want to run your tests in an async way
  // e.g. using promises you can set the sync option to false.
  sync: true,
  //
  // Level of logging verbosity: silent | verbose | command | data | result | error
  logLevel: argv.logLevel ? argv.logLevel : 'error',
  //
  // Enables colors for log output.
  coloredLogs: true,
  //
  // Warns when a deprecated command is used
  deprecationWarnings: false,
  //
  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 100,
  //
  // Saves a screenshot to a given path if a command fails.
  // screenshotPath: './e2e/errorShots/',
  //
  // Set a base URL in order to shorten url command calls. If your `url` parameter starts
  // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
  // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
  // gets prepended directly.
  baseUrl: process.env.REACT_APP_APP_ROOT,
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout:
    process.env.DOCKER || process.env.BROWSERSTACK_USERNAME ? 30000 : 10000,
  //
  // Default timeout in milliseconds for request
  // if Selenium Grid doesn't send response
  connectionRetryTimeout: 90000,
  //
  // Default request retries count
  connectionRetryCount: 10,
  //
  // Initialize the browser instance with a WebdriverIO plugin. The object should have the
  // plugin name as key and the desired plugin options as properties. Make sure you have
  // the plugin installed before running any tests. The following plugins are currently
  // available:
  // WebdriverCSS: https://github.com/webdriverio/webdrivercss
  // WebdriverRTC: https://github.com/webdriverio/webdriverrtc
  // Browserevent: https://github.com/webdriverio/browserevent
  // plugins: {
  //     webdrivercss: {
  //         screenshotRoot: 'my-shots',
  //         failedComparisonsRoot: 'diffs',
  //         misMatchTolerance: 0.05,
  //         screenWidth: [320,480,640,1024]
  //     },
  //     webdriverrtc: {},
  //     browserevent: {}
  // },
  //
  // Test runner services
  // Services take over a specific job you don't want to take care of. They enhance
  // your test setup with almost no effort. Unlike plugins, they don't add new
  // commands. Instead, they hook themselves up into the test process.
  // services: [],//
  // Framework you want to run your specs with.
  // The following are supported: Mocha, Jasmine, and Cucumber
  // see also: http://webdriver.io/guide/testrunner/frameworks.html
  //
  // Make sure you have the wdio adapter package for the specific framework installed
  // before running any tests.
  framework: 'jasmine',
  //
  // Test reporter for stdout.
  // The only one supported by default is 'dot'
  // see also: http://webdriver.io/guide/reporters/dot.html
  reporters: selectedReporters,
  reporterOptions: {
    junit: {
      outputDir: './e2e/test-results'
    }
  },

  //
  // Options to be passed to Jasmine.
  jasmineNodeOpts: {
    //
    // Jasmine default timeout
    defaultTimeoutInterval: 60000 * 10,
    //
    // The Jasmine framework allows interception of each assertion in order to log the state of the application
    // or website depending on the result. For example, it is pretty handy to take a screenshot every time
    // an assertion fails.
    expectationResultHandler: function(passed, assertion) {
      // do something
    },
    stopOnSpecFailure: true
  },

  mountebankConfig: {
    proxyConfig: {
      imposterPort: '8088',
      imposterProtocol: 'https',
      imposterName: 'Linode-API',
      proxyHost: 'https://api.linode.com/v4',
      mutualAuth: true
    }
  },

  testUser: '', // SET IN THE BEFORE HOOK PRIOR TO EACH TEST

  //
  // =====
  // Hooks
  // =====
  // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
  // it and to build services around it. You can either apply a single function or an array of
  // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
  // resolved to continue.
  /**
   * Gets executed once before all workers get launched.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  onPrepare: function(config, capabilities, user) {
    // if ((parallelRunners > 1) && (CRED_STORE_MODE === 'fs')) {
    // throw new Error("***** Can't use filesystem cred store when parallelRunners > 1.\n***** Set CRED_STORE_MODE=mongolocal in .env and launch mongodb by running: docker run -d -p 27017:27017 mongo");
    // }

    // Generate temporary test credentials and store for use across tests
    credStore.generateCreds(config, parallelRunners).catch(e => {
      // if we got here, most likely mongo isn't running locally
      if (CRED_STORE_MODE === 'mongolocal') {
        console.error(
          '***** MAKE SURE MONGO IS RUNNING, do: docker run -d -p 27017:27017 mongo *****'
        );
      }
    });
  },
  /**
   * TODO Gets executed just before initializing the webdriver session and test framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  // beforeSession: function (config, capabilities, specs) {
  //     return credStore.checkoutCreds(specs[0])
  //         .then((testCreds) => {
  //             creds = testCreds;
  //         }).catch((err) => console.log(err));
  // },
  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  before: function(capabilities, specs) {
    // Load up our custom commands
    require('@babel/register');

    browserCommands();
    // Timecount needed to generate unqiue timestamp values for mocks
    global.timeCount = 0;

    if (argv.record) {
      browser.loadProxyImposter(browser.options.mountebankConfig.proxyConfig);
    }

    if (argv.replay) {
      const file = specs[0].replace('.js', '-stub.json');
      const imposter = JSON.parse(readFileSync(file));
      browser.loadImposter(imposter);
    }

    // if (browser.options.requestedCapabilities.jsonwpCaps.browserName.includes('chrome')) {
    //     browser.setTimeout('pageLoad', process.env.DOCKER ? 30000 : 20000);
    // }

    // if (browser.options.desiredCapabilities.jsonwpCaps.browserName.includes('edge')) {
    //     browser.windowHandleMaximize();
    // }

    // inject browser object into credstore for login and a few other functions
    credStore.setBrowser(browser);

    // inject credStore into browser so it can be easily accessed from test cases
    // and utility code
    browser.credStore = credStore;

    // TODO We are now checking out credentials in the beforeSession hook,
    // This will allow us to do api calls before the session
    browser.call(() => {
      return credStore
        .checkoutCreds(specs[0])
        .then(testCreds => {
          creds = testCreds;
        })
        .catch(err => console.log(err));
    });
    credStore.login(creds.username, creds.password, false);
  },
  /**
   * Runs before a WebdriverIO command gets executed.
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   */
  // beforeCommand: function (commandName, args) {
  // },

  /**
   * Hook that gets executed before the suite starts
   * @param {Object} suite suite details
   */

  /**
   * Function to be executed before a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
   * @param {Object} test test details
   */
  // beforeTest: function (test) {
  // },
  /**
   * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
   * beforeEach in Mocha)
   */
  // beforeHook: function () {
  // },
  /**
   * Hook that gets executed _after_ a hook within the suite ends (e.g. runs after calling
   * afterEach in Mocha)
   */
  // afterHook: function () {
  // },
  /**
   * Function to be executed after a test (in Mocha/Jasmine) or a step (in Cucumber) ends.
   * @param {Object} test test details
   */
  afterTest: function(test) {},
  /**
   * Hook that gets executed after the suite has ended
   * @param {Object} suite suite details
   */
  afterSuite: function(suite) {},

  /**
   * Runs after a WebdriverIO command gets executed
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   * @param {Number} result 0 - command success, 1 - command error
   * @param {Object} error error object if any
   */
  afterCommand: function(commandName, args, result, error) {},
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   * @param {Number} result 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  after: function(result, capabilities, specs) {
    if (argv.record) {
      const recordingFile = specs[0].replace('.js', '-stub.json');
      browser.getImposters(true, recordingFile);
      browser.deleteImposters();
    }

    if (argv.replay) {
      browser.deleteImposters();
    }

    // Set "inUse:false" on the account under test in the credentials file
    browser.call(() => credStore.checkinCreds(specs[0]).then(creds => creds));
  },
  /**
   * Gets executed right after terminating the webdriver session.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  afterSession: function(config, capabilities, specs) {},
  /**
   * Gets executed after all workers got shut down and the process is about to exit.
   * @param {Object} exitCode 0 - success, 1 - fail
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  onComplete: function(exitCode, config, capabilities) {
    /* delete all data created during the test and remove test credentials
           from the underlying store */
    return credStore.cleanupAccounts();
  }
};

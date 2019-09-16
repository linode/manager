const moment = require('moment');
const { existsSync, statSync, writeFile, readFile, unlink } = require('fs');

const CredStore = require('./cred-store');

/**
 * Takes test user creds from environment variables and manages them in a json file
 * on the local filesystem.
 */
class FSCredStore extends CredStore {
  constructor(credsFile, shouldCleanupUsingAPI, browser) {
    super(shouldCleanupUsingAPI, browser);
    this.credsFile = credsFile;
    //console.log(this);
  }

  _readCredsFile() {
    return new Promise((resolve, reject) => {
      readFile(this.credsFile, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  }

  _writeCredsFile(credCollection) {
    return new Promise((resolve, reject) => {
      writeFile(this.credsFile, JSON.stringify(credCollection), err => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  /*
   * Not currently used, see comments in utils/cred-store.js
   *
   * Get localStorage after landing on homepage
   * and write them out to a file for use in other tests
   * @returns { String } stringified local storage object
   */
  storeToken(username) {
    // this needs to be fixed.  won't actually update anything given current impl
    // because it's not updating the token in credCollection.
    return this._readCredsFile().then(credCollection => {
      let currentUser = credCollection.find(cred => cred.username === username);

      if (!currentUser.isPresetToken) {
        currentUser.token = this.getTokenFromLocalStorage();
      }

      return this._writeCredsFile(credCollection);
    });
  }

  readToken(username) {
    return this._readCredsFile().then(credCollection => {
      const currentUserCreds = credCollection.find(
        cred => cred.username === username
      );
      return currentUserCreds['token'];
    });
  }

  checkoutCreds(specFile) {
    console.log('checkoutCreds: ' + specFile);
    return this._readCredsFile().then(credCollection => {
      const creds = credCollection.find((cred, i) => {
        if (!cred.inUse) {
          credCollection[i].inUse = true;
          credCollection[i].spec = specFile;

          this.browser.options.testUser = credCollection[i].username;
          return true;
        }
      });
      return this._writeCredsFile(credCollection).then(() => creds);
    });
  }

  checkinCreds(specFile) {
    console.log('checkinCreds: ' + specFile);

    return this._readCredsFile().then(credCollection => {
      const creds = credCollection.find((cred, i) => {
        if (cred.spec === specFile) {
          credCollection[i].inUse = false;
          credCollection[i].spec = '';
          // credCollection[i].token = '';

          return true;
        }
      });
      return this._writeCredsFile(credCollection).then(() => creds);
    });
  }

  generateCreds(config, userCount) {
    const credCollection = [];

    const setCredCollection = (userKey, userIndex) => {
      const setEnvToken = process.env[`MANAGER_OAUTH${userIndex}`];
      const token = !!setEnvToken ? setEnvToken : '';
      const tokenFlag = !!token;
      credCollection.push({
        username: process.env[`${userKey}${userIndex}`],
        password: process.env[`MANAGER_PASS${userIndex}`],
        inUse: false,
        token: token,
        spec: '',
        isPresetToken: tokenFlag
      });
    };

    setCredCollection('MANAGER_USER', '');
    if (userCount > 1) {
      for (let i = 2; i <= userCount; i++) {
        setCredCollection('MANAGER_USER', `_${i}`);
      }
    }

    console.log('adding users:');
    console.log(credCollection);
    return this._writeCredsFile(credCollection);
  }

  getAllCreds() {
    return this._readCredsFile();
  }

  cleanupAccounts() {
    return super
      .cleanupAccounts()
      .catch(err => console.log(err))
      .then(() => {
        return new Promise((resolve, reject) => {
          unlink(this.credsFile, err => {
            if (err) {
              reject(err);
            } else {
              resolve(this.credsFile);
            }
          });
        });
      });
  }
}

if (process.argv[2] == 'test-fs') {
  console.log('running fs credential tests');

  let mockTestConfig = {
    host: 'selenium',
    port: 4444,
    sync: true,
    specs: ['./e2e/specs/search/smoke-search.spec.js'],
    suites: {},
    exclude: ['./e2e/specs/accessibility/*.spec.js'],
    logLevel: 'silent',
    coloredLogs: true,
    deprecationWarnings: false,
    baseUrl: 'http://localhost:3000',
    bail: 0,
    waitforInterval: 500,
    waitforTimeout: 30000,
    framework: 'jasmine',
    reporters: ['spec', 'junit'],
    reporterOptions: { junit: { outputDir: './e2e/test-results' } },
    maxInstances: 1,
    maxInstancesPerCapability: 100,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    debug: false,
    execArgv: null,
    mochaOpts: { timeout: 10000 },
    jasmineNodeOpts: { defaultTimeoutInterval: 600000 },
    before: [null],
    beforeSession: [],
    beforeSuite: [],
    beforeHook: [],
    beforeTest: [],
    beforeCommand: [],
    afterCommand: [],
    afterTest: [],
    afterHook: [],
    afterSuite: [],
    afterSession: [],
    after: [null],
    onError: [],
    onReload: [],
    beforeFeature: [],
    beforeScenario: [],
    beforeStep: [],
    afterFeature: [],
    afterScenario: [],
    afterStep: [],
    mountebankConfig: {
      proxyConfig: {
        imposterPort: '8088',
        imposterProtocol: 'https',
        imposterName: 'Linode-API',
        proxyHost: 'https://api.linode.com/v4',
        mutualAuth: true
      }
    },
    testUser: '',
    watch: false
  };

  let credStore = new FSCredStore('/tmp/e2e-users.js', false);

  // assumes env var config for 2 test users, see .env or .env.example
  credStore
    .generateCreds(mockTestConfig, 2)
    .then(r => {
      console.log('checking out creds');
      return credStore.checkoutCreds('spec1');
    })
    .then(creds => {
      console.log('checked out creds are:');
      console.log(creds);
      return credStore.checkinCreds('spec1');
    })
    .then(creds => {
      console.log('checked in creds are:');
      console.log(creds);
      return credStore.readToken(creds.username);
    })
    .then(token => {
      return credStore.getAllCreds();
    })
    .then(allCreds => {
      console.log('got all creds:');
      console.log(allCreds);
      return credStore.cleanupAccounts();
    })
    .catch(err => {
      console.log('fs cred store test failed somewhere');
      console.log(err);
    });
}
module.exports = FSCredStore;

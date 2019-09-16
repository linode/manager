const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const CredStore = require('./cred-store');

/**
 * Takes test user creds from environment variables and manages them in via a mongodb.
 *
 * Designed to be used when running e2e tests via docker compose (see integration-test.yml).
 */
class MongoCredStore extends CredStore {
  constructor(dbHost, shouldCleanupUsingAPI, browser) {
    super(shouldCleanupUsingAPI, browser);
    //console.log("connecting to mongodb host: " + dbHost);

    // Connection URL
    this.dbUrl = 'mongodb://' + dbHost + ':27017';

    // Database Name
    this.dbName = 'test-credentials';
    this.collectionName = 'users';
    //console.log(this);
  }

  // return MongoClient for use in chained promises
  _connect() {
    return MongoClient.connect(this.dbUrl, { useNewUrlParser: true }).catch(
      err => {
        console.log('error connecting to mongo');
        console.log(err);
      }
    );
  }

  generateCreds(config, userCount) {
    // stores connection to mongo for use in chained promises
    let mongo = null;

    return this._connect()
      .then(mongoClient => {
        console.log('populating creds');
        mongo = mongoClient;

        const collection = mongoClient
          .db(this.dbName)
          .collection(this.collectionName);
        return collection.createIndexes([
          { key: { inUse: 1, username: 1, spec: 1 } }
        ]);
      })
      .then(result => {
        console.log('initiailized users index');

        const setCredCollection = (userKey, userIndex) => {
          const setEnvToken = process.env[`MANAGER_OAUTH${userIndex}`];
          const token = setEnvToken ? setEnvToken : '';
          const tokenFlag = token !== '';

          let userRecord = {
            username: process.env[`${userKey}${userIndex}`],
            password: process.env[`MANAGER_PASS${userIndex}`],
            inUse: false,
            token: token,
            spec: '',
            isPresetToken: tokenFlag
          };

          const collection = mongo
            .db(this.dbName)
            .collection(this.collectionName);
          return collection.insertOne(userRecord).then(() => userRecord);
        };

        const users = [setCredCollection('MANAGER_USER', '')];

        if (userCount > 1) {
          for (let i = 2; i <= userCount; i++) {
            users.push(setCredCollection('MANAGER_USER', `_${i}`));
          }
        }
        return Promise.all(users);
      })
      .then(users => {
        console.log('adding ' + users.length + ' users:');
        users.forEach(user => {
          console.log(user);
        });
        console.log('closing mongo client for populating creds');
        return mongo.close();
      });
  }

  // fetches all available creds
  getAllCreds() {
    let mongo = null;
    return this._connect()
      .then(mongoClient => {
        mongo = mongoClient;
        return mongo
          .db(this.dbName)
          .collection(this.collectionName)
          .find({});
      })
      .then(allCreds => {
        let credsCollection = allCreds.toArray();
        return mongo.close().then(r => {
          return credsCollection;
        });
      });
  }

  checkoutCreds(specToRun) {
    let mongo = null;
    return this._connect()
      .then(mongoClient => {
        mongo = mongoClient;
        return mongo
          .db(this.dbName)
          .collection(this.collectionName)
          .findOneAndUpdate(
            { inUse: false },
            { $set: { inUse: true, spec: specToRun } },
            { returnOriginal: false }
          );
      })
      .then(result => {
        console.log('checked out creds');
        const creds = result.value;

        this.browser.options.testUser = creds.username;

        return mongo.close().then(r => {
          return creds;
        });
      })
      .catch(err => {
        console.log('error checking out creds for spec: ' + specToRun);
        console.log(err);
      });
  }

  checkinCreds(specThatRan) {
    // get the cred that's in use for the given spec
    // then mark it as not in use (and available for the next spec)
    let mongo = null;
    return this._connect()
      .then(mongoClient => {
        mongo = mongoClient;

        return mongo
          .db(this.dbName)
          .collection(this.collectionName)
          .findOneAndUpdate(
            { spec: specThatRan },
            { $set: { inUse: false, spec: '' } },
            { returnOriginal: false }
          );
      })
      .then(result => {
        console.log('checked in creds');
        const creds = result.value;
        return mongo.close().then(r => {
          return creds;
        });
      })
      .catch(err => {
        console.log('error checking in creds for spec: ' + specThatRan);
        console.log(err);
      });
  }

  readToken(username) {
    let mongo = null;
    return this._connect()
      .then(mongoClient => {
        mongo = mongoClient;
        return mongo
          .db(this.dbName)
          .collection(this.collectionName)
          .findOne({ username: username });
      })
      .then(creds => {
        console.log('read token for user: ' + username);
        return mongo.close().then(r => creds.token);
      });
  }

  storeToken(username) {
    throw 'MongoCredStore.storeToken not implemented. See comments in utils/cred-store.js.';
  }

  cleanupAccounts() {
    return super
      .cleanupAccounts()
      .catch(err => console.log(err))
      .then(users => {
        let mongo = null;
        return this._connect()
          .then(mongoClient => {
            console.log('dropping mongo creds collection');
            mongo = mongoClient;
            return mongo
              .db(this.dbName)
              .collection(this.collectionName)
              .drop();
          })
          .then(result => {
            console.log('closing mongo client for cleanup');
            return mongo.close();
          });
      })
      .catch(err => console.log(err));
  }
}

// runs test in if block below if this script is called directly with a "test-mongo" arg
// for example:
//  source .env && node e2e/utils/mongo-cred-store.js test-mongo
//
// otherwise export a mongo credstore object instance for use in e2e tests when running via
// docker componse
if (process.argv[2] == 'test-mongo') {
  // NOTE: test below requires mongo to be running locally via
  //   docker run -d -p 27017:27017 mongo
  console.log('running mongo credential tests');

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
  let mongoCredStore = new MongoCredStore('localhost', false);

  // assumes env var config for 2 test users, see .env or .env.example
  mongoCredStore
    .generateCreds(mockTestConfig, 2)
    .then(r => {
      console.log('checking out creds');
      return mongoCredStore.checkoutCreds('spec1');
    })
    .then(creds => {
      console.log('checked out creds are:');
      console.log(creds);
      return mongoCredStore.checkinCreds('spec1');
    })
    .then(creds => {
      console.log('checked in creds are:');
      console.log(creds);
      return mongoCredStore.readToken(creds.username);
    })
    .then(token => {
      console.log('token for username is: ' + token);
      return mongoCredStore.getAllCreds();
    })
    .then(allCreds => {
      console.log('got all creds:');
      console.log(allCreds);
      return mongoCredStore.cleanupAccounts();
    })
    .catch(err => {
      console.log('mongo cred store test failed somewhere');
      console.log(err);
    });
}

module.exports = MongoCredStore;

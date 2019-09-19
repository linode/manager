const { writeFileSync, readFileSync } = require('fs');
const axios = require('axios');
const inquirer = require('inquirer');

const proxyImposter = config => {
  const imposter = {
    port: config.imposterPort,
    protocol: config.imposterProtocol,
    name: config.imposterName,
    allowCORS: true,
    addWaitBehavior: true,
    stubs: [
      {
        responses: [
          {
            proxy: {
              to: config.proxyHost,
              mode: 'proxyAlways',
              predicateGenerators: [
                {
                  matches: {
                    method: true,
                    path: true,
                    query: true,
                    body: true
                  }
                }
              ],
              injectHeaders: {
                'Accept-Encoding': 'identity'
              }
            }
          }
        ]
      }
    ]
  };

  // Add certificate and key to imposter when specified
  if (config.hasOwnProperty('key') && config.hasOwnProperty('cert')) {
    imposter['key'] = config.key;
    imposter['cert'] = config.cert;
  }

  /*  If mutual auth is true, the server will request a client certificate.
   *   Since the goal is simply to virtualize a server requiring mutual auth,
   *   invalid certificates will not be rejected.
   */
  if (config.hasOwnProperty('mutualAuth')) {
    imposter['mutualAuth'] = config.mutualAuth;
  }

  return imposter;
};

const instance = axios.create({
  baseURL: 'http://localhost:2525',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

const mountebankEndpoint = '/imposters?replayable=true';

/*
 * Sends POST to mountebank to load an imposter that proxies
 * @param { Object } imposter Imposter object
 * @returns { Promise } Resolves with response data
 */
exports.loadProxyImposter = proxyConfig => {
  return new Promise((resolve, reject) => {
    const imposterObject = proxyImposter(proxyConfig);

    instance
      .post(mountebankEndpoint, imposterObject)
      .then(response => resolve(response.data))
      .catch(error => reject(console.error(error)));
  });
};

/*
 * Sends PUT request to mountebank to load an imposter
 * @param { Object } imposter Imposter object
 * @returns { Promise } Resolves with response data
 */
exports.loadImposter = imposter => {
  return new Promise((resolve, reject) => {
    instance
      .put(mountebankEndpoint, imposter)
      .then(response => resolve(response.data))
      .catch(error => reject(console.error(error)));
  });
};

/*
 * GET imposters from mountebank
 * @param { Boolean } removeProxies Adds Remove proxies param to remove proxy stubs
 * @param { String } file filepath and filename to save imposters.
 * @returns { Promise } Resolves writing response data to file
 */
exports.getImposters = (removeProxies, file) => {
  return new Promise((resolve, reject) => {
    const removeProxyParam = '&removeProxies=true';

    instance
      .get(
        removeProxies
          ? mountebankEndpoint + removeProxyParam
          : mountebankEndpoint
      )
      .then(response => {
        if (!removeProxies) {
          // Move proxies to the last array
          const stubsArray = response.data.imposters[0].stubs;
          stubsArray.push(stubsArray.shift());
        }

        resolve(writeFileSync(file, JSON.stringify(response.data)));
      })
      .catch(error => reject(console.error(error)));
  });
};

/*
 * Sends a DELETE request to remove all imposters from mountebank
 * @returns { Promise } Resolves with response data
 */
exports.deleteImposters = () => {
  return new Promise((resolve, reject) => {
    const impostersEndPoint = '/imposters';
    instance
      .delete(impostersEndPoint)
      .then(response => resolve(response.data))
      .catch(error => reject(console.error(error)));
  });
};

exports.promptAndSanitize = stubPath => {
  const sanitizeStub = (stubPath, username) => {
    const stubFile = readFileSync(stubPath, 'utf8');

    const ipv4ModifiedRegex = new RegExp(
      [
        // Ignore 2. 3. and 4. addresses because they match Linux kernel versions!
        /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]|[015-9])\./, // first octet
        /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\./, // second octet
        /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\./, // third octet
        /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g // fourth octet
      ]
        .map(function(r) {
          return r.source;
        })
        .join(''),
      'g'
    );

    const usernameRegex = new RegExp(username, 'g');

    const ipv6Regex = /([0-9A-Fa-f]{1,4}:([0-9A-Fa-f]{1,4}:([0-9A-Fa-f]{1,4}:([0-9A-Fa-f]{1,4}:([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{0,4}|:[0-9A-Fa-f]{1,4})?|(:[0-9A-Fa-f]{1,4}){0,2})|(:[0-9A-Fa-f]{1,4}){0,3})|(:[0-9A-Fa-f]{1,4}){0,4})|:(:[0-9A-Fa-f]{1,4}){0,5})((:[0-9A-Fa-f]{1,4}){2}|:(25[0-5]|(2[0-4]|1[0-9]|[1-9])?[0-9])(\.(25[0-5]|(2[0-4]|1[0-9]|[1-9])?[0-9])){3})|(([0-9A-Fa-f]{1,4}:){1,6}|:):[0-9A-Fa-f]{0,4}|([0-9A-Fa-f]{1,4}:){7}:/g;

    const sanitized = stubFile
      .replace(ipv4ModifiedRegex, '127.0.0.1')
      .replace(ipv6Regex, 'fe80::ab8')
      .replace(usernameRegex, 'test-user');

    JSON.parse(sanitized);

    return writeFileSync(stubPath, sanitized);
  };

  return inquirer
    .prompt([
      {
        name: 'Username',
        type: 'input',
        message: 'Enter the username used to record this mock session:'
      }
    ])
    .then(answers => sanitizeStub(stubPath, answers.Username));
};

#!/usr/local/bin/node

const { readFileSync } = require('fs');
const yargs = require('yargs');

const {
  loadProxyImposter,
  loadImposter,
  getImposters,
  deleteImposters,
  promptAndSanitize,
} = require('../e2e/utils/mb-utils');

yargs
  .command(
    '$0',
    'Tool to facilitate creating/saving API mocks with Mountebank',
    function (yargs) {
      return yargs
          .option('r', {
            alias: 'record',
            describe: 'Record Linode API calls by creating an imposter that proxies to a given environment'
          }).option('s', {
            alias: 'save',
            describe: 'Save the current session API calls to the path specified. Configs are JSON files saved to `src/__data__/mocks`',
          }).option('l', {
            alias: ['load', 'config', 'conf'],
            describe: 'Load a saved config file from `src/__data__/mocks`',
          }).option('d', {
            alias: ['delete', 'rm'],
            describe: 'Remove all mocks from Mountebank',
          }).option('base', {
            describe: 'API Base Url',
            default: 'https://api.linode.com/v4',
          })
    },
    function (argv) {
        const proxyConfig = {
            imposterPort: '8088',
            imposterProtocol: 'https',
            imposterName: 'Linode-API',
            proxyHost: argv.base,
            mutualAuth: true,
        }

        if (argv.r) {
            return loadProxyImposter(proxyConfig);
        }

        if (argv.s) {
            getImposters(false, `src/__data__/mocks/${argv.save}`);
            return promptAndSanitize(`src/__data__/mocks/${argv.save}`);
        }

        if (argv.l) {
            const configFile = readFileSync(`src/__data__/mocks/${argv.config}`);
            return loadImposter(JSON.parse(configFile));
        }

        if (argv.d) {
            return deleteImposters();
        }

    }
  )
  .help()
  .argv


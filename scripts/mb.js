#!/usr/local/bin/node

const { readFileSync } = require('fs');
const { argv } = require('yargs');

const { loadProxyImposter, loadImposter, getImposters, deleteImposters } = require('../e2e/utils/mb-utils');

const proxyConfig = {
    imposterPort: '8088',
    imposterProtocol: 'https',
    imposterName: 'Linode-API',
    proxyHost: argv.base ? argv.base : 'https://api.linode.com/v4',
    mutualAuth: true,
}

if (argv.r || argv.record) {
    return loadProxyImposter(proxyConfig);
}

if (argv.s || argv.save) {
    return getImposters(false, `src/__data__/mocks/${argv.save}`);
}

if (argv.conf || argv.config) {
    const configFile = readFileSync(`src/__data__/mocks/${argv.config}`);
    return loadImposter(JSON.parse(configFile));
}

if (argv.rm || argv.remove) {
    return deleteImposters();
}

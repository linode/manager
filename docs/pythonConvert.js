#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');
const _ = require('lodash');

const BASE_PATH = './src/data';
const ROUTE_BASE_PYTHON = '/guides/python';

const pythonPath = path.join(BASE_PATH, 'python');
const files = fs.readdirSync(pythonPath);

let pythonObjects = files.filter(function(fileName) {
  return path.extname(fileName) === '.yaml';
}).map(function(fileName) {
  const filePath = path.join(pythonPath, fileName);
  const pythonObject = yaml.safeLoad(fs.readFileSync(filePath, 'utf-8'), { json: true });

  return pythonObject;
});

let pythonObjectMap = {
  'LinodeLoginClient': {
    name: 'LinodeLoginClient',
    path: '/linode-login-client',
    routePath: `${ROUTE_BASE_PYTHON}/linode-login-client`,
    formattedPythonObject: [],
  },
  'LinodeClient': {
    name: 'LinodeClient',
    path: '/linode-client',
    routePath: `${ROUTE_BASE_PYTHON}/linode-client`,
    formattedPythonObject: [],
  },
  'Linode': {
    name: 'Linode',
    path: '/linode',
    routePath: `${ROUTE_BASE_PYTHON}/linode`,
    formattedPythonObject: [],
  },
  'Config': {
    name: 'Config',
    path: '/config',
    routePath: `${ROUTE_BASE_PYTHON}/config`,
    formattedPythonObject: [],
  },
  'Disk': {
    name: 'Disk',
    path: '/disk',
    routePath: `${ROUTE_BASE_PYTHON}/disk`,
    formattedPythonObject: [],
  },
  'Region': {
    name: 'Region',
    path: '/region',
    routePath: `${ROUTE_BASE_PYTHON}/region`,
    formattedPythonObject: [],
  },
  'Distribution': {
    name: 'Distribution',
    path: '/distribution',
    routePath: `${ROUTE_BASE_PYTHON}/distribution`,
    formattedPythonObject: [],
  },
  'Backup': {
    name: 'Backup',
    path: '/backup',
    routePath: `${ROUTE_BASE_PYTHON}/backup`,
    formattedPythonObject: [],
  },
  'IPAddress': {
    name: 'IPAddress',
    path: '/ipaddress',
    routePath: `${ROUTE_BASE_PYTHON}/ipaddress`,
    formattedPythonObject: [],
  },
  'IPv6Address': {
    name: 'IPv6Address',
    path: '/ipv6address',
    routePath: `${ROUTE_BASE_PYTHON}/ipv6address`,
    formattedPythonObject: [],
  },
  'Kernel': {
    name: 'Kernel',
    path: '/kernel',
    routePath: `${ROUTE_BASE_PYTHON}/kernel`,
    formattedPythonObject: [],
  },
  'Service': {
    name: 'Service',
    path: '/service',
    routePath: `${ROUTE_BASE_PYTHON}/service`,
    formattedPythonObject: [],
  },
  'StackScript': {
    name: 'StackScript',
    path: '/stackscript',
    routePath: `${ROUTE_BASE_PYTHON}/stackscript`,
    formattedPythonObject: [],
  },
  'DNS Zone': {
    name: 'DNS Zone',
    path: '/dnszone',
    routePath: `${ROUTE_BASE_PYTHON}/dnszone`,
    formattedPythonObject: [],
  },
  'DNS Zone Record': {
    name: 'DNS Zone Record',
    path: '/dnszone-record',
    routePath: `${ROUTE_BASE_PYTHON}/dnszone-record`,
    formattedPythonObject: [],
  },
};

pythonObjects.forEach(function(pythonObject) {
  if (pythonObjectMap[pythonObject.name]) {
    pythonObjectMap[pythonObject.name].formattedPythonObject = pythonObject;
  }
});
const data = JSON.stringify(pythonObjectMap, null, 2);
const pythonModule = `module.exports = { pythonObjects: ${data} };`;
fs.writeFileSync(path.join(pythonPath, 'python.js'), pythonModule);


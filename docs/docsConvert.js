#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const _ = require('lodash');

const BASE_PATH = './src/data';
const dirs = fs.readdirSync(BASE_PATH);


function formatEndpoint(endpoint) {
  let endpoints = null;
  if (endpoint.endpoints) {
    endpoints = Object.keys(endpoint.endpoints).map(function(path) {
      return _.merge({}, endpoint.endpoints[path], {
        path: path
      });
    });
  }

  return {
    name: endpoint.name,
    basePath: endpoint.base_path,
    description: endpoint.description,
    endpoints: endpoints,
  };
}

dirs.forEach(function(dirName) {
  const dirPath = path.join(BASE_PATH, dirName);
  const files = fs.readdirSync(dirPath);

  files.filter(function(fileName) {
    return path.extname(fileName) === '.json';
  }).forEach(function(fileName) {
    const filePath = path.join(dirPath, fileName);
    const data = JSON.stringify(formatEndpoint(JSON.parse(fs.readFileSync(filePath, 'utf-8'))));
    const asModule = `module.exports = ${data};`;

    const newFileName = `${fileName.split('.')[0]}.js`;
    const newFilePath = path.join(dirPath, newFileName);

    fs.writeFileSync(newFilePath, asModule);
  });
});

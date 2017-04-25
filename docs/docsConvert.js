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
      const childEndpoint = endpoint.endpoints[path];
      const formattedEndpoint = formatEndpoint(childEndpoint);
      return _.merge({}, formattedEndpoint, {
        path: path
      });
    });
  }

  let methods = null;
  if (endpoint.methods) {
    methods = Object.keys(endpoint.methods).map(function(method) {
      const methodObj = endpoint.methods[method];

      let examples;
      if (methodObj.examples) {
        examples = Object.keys(methodObj.examples).map(function(example) {
          return {
            name: example,
            value: methodObj.examples[example]
          };
        });
      }

      return _.merge({}, methodObj, {
        name: method,
        examples: examples
      });
    });
  }

  return {
    name: endpoint.name,
    basePath: endpoint.base_path,
    description: endpoint.description,
    endpoints: endpoints,
    methods: methods
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

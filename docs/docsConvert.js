#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const _ = require('lodash');

const BASE_PATH = './src/data';
const dirs = fs.readdirSync(BASE_PATH);

const apiObjectMap = require('./src/data/objects/index').apiObjectMap;


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

      // IF this is a GET endpoint and has an associated resource object, combine them
      let resourceObject;
      if (method === 'GET' && endpoint.resource) {
        let resource = endpoint.resource;

        // mismatch rewrites
        if (resource === 'account') {
          resource = 'profile';
        }

        resourceObject = apiObjectMap[resource];
        if (!resourceObject && (resource.charAt(resource.length - 1) === 's')) {
          resourceObject = apiObjectMap[resource.substr(0, resource.length - 1)];
        }

        let enums;
        let schema;
        if (resourceObject) {
          enums = resourceObject.enums;
          if (enums) {
            resourceObject.enums = Object.keys(enums).map(function(enumName) {
              return _.merge({}, enums[enumName], {
                name: enumName
              });
            });
          }

          schema = resourceObject.schema;
          if (schema) {
            resourceObject.schema = Object.keys(schema).map(function(schemaName) {
              const schemaField = schema[schemaName];
              return {
                name: schemaName,
                description: schemaField._description,
                editable: schemaField._editable,
                type: schemaField._type,
                value: schemaField._value
              };
            });
          }
        }
      }

      let examples;
      if (methodObj.examples) {
        examples = Object.keys(methodObj.examples).map(function(example) {
          return {
            name: example,
            value: methodObj.examples[example]
          };
        });
      }

      let params;
      if (methodObj.params) {
        params = Object.keys(methodObj.params).map(function(paramName) {
          const param = methodObj.params[paramName];

          return _.merge({}, param, {
            name: paramName
          });
        });
      }

      return _.merge({}, methodObj, {
        name: method,
        examples: examples,
        params: params,
        resource: resourceObject
      });
    });
  }

  return _.merge({}, endpoint, {
    basePath: endpoint.base_path,
    endpoints: endpoints,
    methods: methods
  });
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

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const _ = require('lodash');

const BASE_PATH = './src/data';
const apiObjectMap = require('./src/data/objects/index').apiObjectMap;

const ROUTE_BASE_PATH = '/reference';

function stripATags(description) {
  if (description) {
    if (description.match(/href/)) {
      // First the obligatory warning messages
      // https://blog.codinghorror.com/parsing-html-the-cthulhu-way/
      // http://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags/1732454#1732454
      // find '<a' the beginning of the tag
      // .* any character
      // ? non greedy meaning stop after you've found the first match
      // find '">' the end of the tag
      // (space star) [ *] find zero or more spaces
      // g global over the entire string
      description = description.replace(/<a.*?"> */g, '');
      description = description.replace(/<\/a>/g, '');
    }
  }
  return description;
}

function convertUlToArray(description) {
  let matches;
  const listItems = [];
  let descText;
  if (description) {
    if (typeof description === "string") {
      if (description.match(/<ul>/)) {
        descText = description.replace(/<ul>.*/, '');
        matches = description.match(/<li>.*?<\/li>/g);
        matches.forEach(function(mat) {
          listItems.push(mat.replace(/<li>/, '').replace(/<\/li>/, ''));
        });
        description = {descText, listItems};
      }
    }
  }
  return description;
}



function formatMethodParams(methodObj) {
  let params;
  if (methodObj.params) {
    params = Object.keys(methodObj.params).map(function(paramName) {
      const param = methodObj.params[paramName];

      param.description = stripATags(param.description);
      return _.merge({}, param, {
        name: paramName
      });
    });
  }
  return params;
}

function formatMethodExamples(methodObj) {
  let examples;
  if (methodObj.examples) {
    examples = Object.keys(methodObj.examples).map(function(example) {
      return {
        name: example,
        value: methodObj.examples[example]
      };
    });
  }
  return examples;
}

function formatMethodResource(endpoint, method) {
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

          let description;
          if (schemaField._description) {
            description = schemaField._description;
          } else {
            description = schemaField.description;
          }

          description = convertUlToArray(description);
          return {
            name: schemaName,
            description: description,
            editable: schemaField._editable,
            type: schemaField._type,
            value: schemaField._value
          };
        });
      }
    }
  }

  return resourceObject;
}

function formatMethod(endpoint, method) {
  const methodObj = endpoint.methods[method];
  methodObj.description = stripATags(methodObj.description);
  const resourceObj = formatMethodResource(endpoint, method);
  const examples = formatMethodExamples(methodObj);
  const params = formatMethodParams(methodObj);

  return _.merge({}, methodObj, {
    name: method,
    examples: examples,
    params: params,
    resource: resourceObj
  });
}


function formatEndpoint(endpoint, path = null) {
  let methods = null;
  if (endpoint.methods) {
    methods = Object.keys(endpoint.methods).map(function(method) {
      return formatMethod(endpoint, method);
    });
  }
  endpoint.description = stripATags(endpoint.description);

  return _.merge({}, endpoint, {
    path: path,
    formattedEndpoints: endpoint.formattedEndpoints || [],
    methods: methods
  });
}

const endpointsPath = path.join(BASE_PATH, 'endpoints');
const files = fs.readdirSync(endpointsPath);


let allEndpoints = files.filter(function(fileName) {
  return path.extname(fileName) === '.json';
}).map(function(fileName) {
  const filePath = path.join(endpointsPath, fileName);
  const endpoint = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  return endpoint;
});

// map and nest
let endpointMap = {
  '/linode': {
    name: 'Linodes',
    path: '/linode',
    routePath: `${ROUTE_BASE_PATH}/linode`,
    formattedEndpoints: []
  },
  '/domains': {
    name: 'Domains',
    path: '/domains',
    routePath: `${ROUTE_BASE_PATH}/domains`,
    formattedEndpoints: []
  },
  '/nodebalancers': {
    name: 'NodeBalancers',
    path: '/nodebalancers',
    routePath: `${ROUTE_BASE_PATH}/nodebalancers`,
    formattedEndpoints: []
  },
  '/networking': {
    name: 'Networking',
    path: '/networking',
    routePath: `${ROUTE_BASE_PATH}/networking`,
    formattedEndpoints: []
  },
  '/regions': {
    name: 'Regions',
    path: '/regions',
    routePath: `${ROUTE_BASE_PATH}/regions`,
    formattedEndpoints: []
  },
  '/support/tickets': {
    name: 'Support',
    path: '/support',
    routePath: `${ROUTE_BASE_PATH}/support`,
    formattedEndpoints: []
  },
  '/account': {
    name: 'Account',
    path: '/account',
    routePath: `${ROUTE_BASE_PATH}/account`,
    formattedEndpoints: []
  },
};

allEndpoints.forEach(function(endpoint) {
  const pathArr = endpoint.base_path.split('/');
  // console.log('PATH ARR: ', pathArr);
  const basePath = `/${pathArr[1]}`;
  const altBasePath = `${basePath}/${pathArr[2]}`;
  console.log('BASE: ', basePath, ' ALT BASE: ', altBasePath);

  if (endpointMap[basePath]) {
    const formatted = formatEndpoint(endpoint, basePath);
    if (formatted.name === 'Account') { formatted.name = ''; }
    endpointMap[basePath].formattedEndpoints.push(formatted);
  } else if (endpointMap[altBasePath]) {
    endpointMap[altBasePath].formattedEndpoints.push(formatEndpoint(endpoint, altBasePath));
  } else {
    console.log('NO MATCH FOUND: ', basePath);
  }
});

// back to an array
allEndpoints = Object.keys(endpointMap).map(function(key) {
  return endpointMap[key];
}).filter(function(endpoint) { return endpoint; });

// map children
allEndpoints = allEndpoints.map(function(endpoint) {
  endpoint.formattedEndpoints = endpoint.formattedEndpoints.map(function(formattedEndpoint) {
    if (formattedEndpoint.endpoints) {
      Object.keys(formattedEndpoint.endpoints).forEach(function(path) {
        const childEndpoint = formattedEndpoint.endpoints[path];
        const childFormattedEndpoint = formatEndpoint(childEndpoint, path);

        childFormattedEndpoint.routePath = `${ROUTE_BASE_PATH}/endpoints/${path}`;
        formattedEndpoint.formattedEndpoints.push(childFormattedEndpoint);
      });
      delete formattedEndpoint.endpoints;
    }
    return formattedEndpoint;
  });
  return endpoint;
});

const data = JSON.stringify(allEndpoints, null, 2);
const endpointModule = `module.exports = { endpoints: ${data} };`;
fs.writeFileSync(path.join(endpointsPath, 'api.js'), endpointModule);

const compressedData = JSON.stringify(allEndpoints);
const compressedModule = `module.exports = { endpoints: ${compressedData} };`;
fs.writeFileSync(path.join(endpointsPath, 'api_min.js'), compressedModule);

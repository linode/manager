#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');
const _ = require('lodash');

const BASE_PATH = './src/data';
const ROUTE_BASE_PATH = `/${process.env.API_VERSION || 'v4'}/reference`;

const objectsPath = path.join(BASE_PATH, 'objects');
const apiObjectMap = {};
fs.readdirSync(objectsPath).filter(function(fileName) {
  return path.extname(fileName) === '.yaml';
}).forEach(function(fileName) {
  const filePath = path.join(objectsPath, fileName);
  apiObjectMap[fileName.split('.')[0].toLowerCase()] = yaml.safeLoad(fs.readFileSync(filePath, 'utf-8'), { json: true });
});

const endpointsPath = path.join(BASE_PATH, 'endpoints');
const files = fs.readdirSync(endpointsPath);

let allEndpoints = files.filter(function(fileName) {
  return path.extname(fileName) === '.yaml';
}).map(function(fileName) {
  const filePath = path.join(endpointsPath, fileName);
  const endpoint = yaml.safeLoad(fs.readFileSync(filePath, 'utf-8'), { json: true });

  return endpoint;
});

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

function getResourceObjByName(name) {
  let resourceName = name.toLowerCase();
  let resourceObject = apiObjectMap[resourceName];
  if (!resourceObject && (resourceName.charAt(resourceName.length - 1) === 's')) {
    resourceObject = apiObjectMap[resourceName.substr(0, resourceName.length - 1)];
  }
  return resourceObject;
}

function formatMethodParams(methodObj) {
  let params;
  if (methodObj.params) {
    params = Object.keys(methodObj.params).map(function(paramName) {
      const param = methodObj.params[paramName];

      param.description = convertUlToArray(stripATags(param.description));

      const type = apiObjectMap[param.type] ? 'integer' : param.type;
      return _.merge({}, param, {
        name: paramName,
        type: type,
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

function formatSchemaExample(schema) {
  const schemaExample = {};

  schema.forEach(function(obj) {
    if (obj.value === undefined && obj.schema) {
      schemaExample[obj.name] = formatSchemaExample(obj.schema);
    } else {
      let value = obj.value;
      if (Array.isArray(value)) {
        value = value.map(function(obj) {
          if (typeof obj === 'object' && obj !== null) {
            return formatSchemaExample(obj);
          }
          return obj;
        });
      }

      schemaExample[obj.name] = value;
    }
  });

  return schemaExample;
}

function formatSchemaField(schemaField, enumMap) {
  let description;
  if (schemaField._description) {
    description = schemaField._description;
  } else {
    description = schemaField.description;
  }
  description = convertUlToArray(description);

  const name = schemaField.name;
  const editable = schemaField._editable;
  const filterable = schemaField._filterable;
  const type = schemaField._type;
  const subType = schemaField._subtype;
  let value = schemaField._value;

  let nestedSchema = null;
  if (apiObjectMap[type]) {
    nestedSchema = formatSchema(getResourceObjByName(type).schema, enumMap);
  } else if (type === 'enum' && enumMap[subType]) {
    nestedSchema = enumMap[subType]; // already formatted
  } else if (!type) {
    // TODO: check the name of the nested item?
    nestedSchema = formatSchema(schemaField, enumMap);
  } else if (Array.isArray(value)) {
    value = value.map(function(obj) {
      if (typeof obj === 'object' && obj !== null) {
        return formatSchema(obj, enumMap);
      }
      return obj;
    });

    if (value.length && typeof value[0] !== 'string') {
      nestedSchema = value[0]; // use the first example in the array as the schema
    }
  }

  return {
    name: name,
    description: description,
    editable: editable,
    filterable: filterable,
    type: type,
    subType: subType,
    value: value,
    schema: nestedSchema
  };
}

function formatSchema(schema, enumMap={}) {
  if (Array.isArray(schema)) {
    return schema;
  }

  return Object.keys(schema).map(function (schemaName) {
    if (typeof schema[schemaName] === 'object' && schema[schemaName] !== null) {
      return formatSchemaField(_.merge(schema[schemaName], { name: schemaName }), enumMap);
    }
    // TODO: account for other cases
  }).filter(function(item) { return item; }); // filter at the end dumps nulls from result of non-object values
}

function createEnumMap(enums) {
  const enumMap = {};

  Object.keys(enums).map(function(enumName) {
    const enumList = enums[enumName];

    enumMap[enumName] = Object.keys(enumList).map(function(key) {
      return {
        name: key,
        description: enumList[key]
      };
    });
  });

  return enumMap;
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

    resourceObject = getResourceObjByName(resource);

    let enums;
    let schema;
    if (resourceObject) {
      enums = resourceObject.enums;

      let enumMap;
      if (enums) {
        enumMap = createEnumMap(enums);
      }

      schema = resourceObject.schema;
      if (schema) {
        resourceObject.schema = formatSchema(schema, enumMap);
        resourceObject.example = formatSchemaExample(resourceObject.schema);
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
  const basePath = `/${pathArr[1]}`;
  const altBasePath = `${basePath}/${pathArr[2]}`;
  console.log('BASE: ', basePath, ' ALT BASE: ', altBasePath);

  if (endpointMap[basePath]) {
    const formatted = formatEndpoint(endpoint, basePath);
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


// rename formattedEndpoints > endpoints
function renameEndpoints(endpoints) {
  return endpoints.map(function(endpoint) {
    endpoint.endpoints = endpoint.formattedEndpoints;
    delete endpoint.formattedEndpoints;
    if (endpoint.endpoints.length) {
      endpoint.endpoints = renameEndpoints(endpoint.endpoints);
    }
    return endpoint;
  });
}
allEndpoints = renameEndpoints(allEndpoints);

const data = JSON.stringify(allEndpoints, null, 2);
const endpointModule = `
  /**
  *   Generated Docs Source -- DO NOT EDIT
  */
  module.exports = { endpoints: ${data} };
`;
fs.writeFileSync(path.join('./src', 'api.js'), endpointModule);

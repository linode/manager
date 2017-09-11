#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');
const _ = require('lodash');

const BASE_PATH = './src/data';
const ROUTE_BASE_PATH = `/${process.env.API_VERSION || 'v4'}/reference`;
const API_ROOT = process.env.API_ROOT || 'https://api.linode.com';
const API_VERSION = process.env.API_VERSION || 'v4';

const pythonPath = path.join(BASE_PATH, 'python');
const pythonFiles = fs.readdirSync(pythonPath);

const objectsPath = path.join(BASE_PATH, 'objects');
const apiObjectMap = {};
fs.readdirSync(objectsPath).filter(function (fileName) {
  return path.extname(fileName) === '.yaml';
}).forEach(function (fileName) {
  const filePath = path.join(objectsPath, fileName);
  const objectName = fileName.split('.')[0].toLowerCase();
  apiObjectMap[objectName] = yaml.safeLoad(fs.readFileSync(filePath, 'utf-8'), { json: true });
});

const endpointsPath = path.join(BASE_PATH, 'endpoints');
const files = fs.readdirSync(endpointsPath);

let allEndpoints = files.filter(function (fileName) {
  return path.extname(fileName) === '.yaml';
}).map(function (fileName) {
  const filePath = path.join(endpointsPath, fileName);
  let endpoint;
  try {
    endpoint = yaml.safeLoad(fs.readFileSync(filePath, 'utf-8'), { json: true });
  } catch (e) {
    throw new Error(`File [${filePath}] could not be read:\n${e.message}`);
  }

  return endpoint;
});

function convertUlToArray(description) {
  if (description) {
    if (typeof description === 'string') {
      if (description.match(/<ul>/)) {
        const descText = description.replace(/<ul>.*/, '');
        const matches = description.match(/<li>.*?<\/li>/g);
        const listItems = [];

        matches.forEach(function (match) {
          listItems.push(match.replace(/<li>/, '').replace(/<\/li>/, ''));
        });

        return { descText, listItems };
      }
    }
  }
  return description;
}

function getResourceObjByName(name) {
  const resourceName = name.toLowerCase();
  let resourceObject = apiObjectMap[resourceName];
  if (!resourceObject && (resourceName.charAt(resourceName.length - 1) === 's')) {
    resourceObject = apiObjectMap[resourceName.substr(0, resourceName.length - 1)];
  }
  return resourceObject;
}

function formatMethodExamples(methodObj, specExample) {
  let examples;
  if (methodObj.examples) {
    examples = Object.keys(methodObj.examples).map(function (example) {
      const json = JSON.stringify(specExample, null, 2);
      return {
        name: example,
        value: methodObj.examples[example]
          .replace(/https:\/\/\$api_root/g, API_ROOT)
          .replace(/\$version/g, API_VERSION)
          .replace(/\$SUB_SPEC_EXAMPLE/g, json),
      };
    });
  }
  return examples;
}

function formatSchemaExample(schema, paginationKey) {
  const schemaExample = {};

  if (!Array.isArray(schema)) {
    // TODO: Account for objects / clean this method up
    return schemaExample;
  }

  schema.forEach(function (obj) {
    if (obj.value === undefined && obj.schema) {
      schemaExample[obj.name] = formatSchemaExample(obj.schema);
      // Pagination key represents an array of objects that we need to look up.
      if (obj.name === paginationKey || obj.isArray) {
        schemaExample[obj.name] = [schemaExample[obj.name]];
      }
    } else {
      let value = obj.value;
      if (Array.isArray(value)) {
        value = value.map(function (obj) {
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
  if (schemaField.description) {
    description = schemaField.description;
  } else {
    description = schemaField.description;
  }
  description = convertUlToArray(description);

  const { name, seeAlso, editable, filterable, type, subtype, isArray, value } = schemaField;
  let lowerType = type && _.isString(type) ? type.toLowerCase() : 'object';

  let nestedSchema = null;
  if (apiObjectMap[lowerType]) {
    // matches a known object from /objects, format using the reference
    // eslint-disable-next-line no-use-before-define
    nestedSchema = formatSchema(getResourceObjByName(lowerType).schema, enumMap);
    lowerType = 'object';
  } else if (lowerType === 'enum' && enumMap[subtype]) {
    // matches a known enum from an enums key on an object in /objects, format using the reference
    nestedSchema = enumMap[subtype]; // already formatted
  } else if (lowerType === 'enum' || lowerType === 'object' || lowerType === 'array' ||
             !lowerType) {
    // is of the checked types, or no type provided (currently undocumented)
    // eslint-disable-next-line no-use-before-define
    nestedSchema = formatSchema(schemaField, enumMap);
    if (nestedSchema) {
      if (nestedSchema[0].name === 'type') {
        nestedSchema = nestedSchema[0].schema;
      }
    }
  }

  // TODO: remove enum, datetime, array, and object from here
  const nonNestedTypes = [
    'boolean', 'integer', 'float', 'string', 'enum', 'datetime', 'array', 'object',
  ];
  if (nestedSchema === null && nonNestedTypes.indexOf(lowerType) === -1) {
    throw new Error(`Unknown object '${name}': got '${lowerType}'`);
  }

  lowerType = _.capitalize(lowerType);
  if (isArray) {
    lowerType = `Array[${_.capitalize(lowerType)}]`;
  }

  // don't show filters for nestedSchemas
  if (Array.isArray(nestedSchema)) {
    nestedSchema = nestedSchema.map(obj => _.omit(obj, 'filterable'));
  }

  return {
    name,
    seeAlso,
    description,
    editable,
    filterable,
    subType: subtype,
    value,
    isArray,
    type: lowerType,
    schema: nestedSchema,
  };
}

function createPaginationSchema(paginationKey, resourceType) {
  return {
    total_pages: {
      type: 'integer',
      description: 'The total number of pages of results.',
      value: 1,
    },
    total_results: {
      type: 'integer',
      description: 'The total number of results.',
      value: 1,
    },
    [paginationKey]: {
      type: resourceType,
      isArray: true,
      description: 'All results for the current page.',
    },
    page: {
      type: 'integer',
      description: 'The current page in the results.',
      value: 1,
    },
  };
}

function formatSchema(schema, enumMap = {}, paginationKey = null, resourceType = null) {
  if (Array.isArray(schema)) {
    return schema;
  }

  if (paginationKey) {
    return formatSchema(createPaginationSchema(paginationKey, resourceType), enumMap);
  }

  const filteredSchemas = _.flatten(Object.keys(schema).map(function (schemaName) {
    const val = schema[schemaName];
    if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
      return formatSchemaField(_.merge(val, { name: schemaName }), enumMap);
    }
  })).filter(Boolean);

  // do not represent array types without nested objects in the schema tables
  if (!filteredSchemas.length) {
    return null;
  }

  return filteredSchemas;
}

function createEnumMap(enums) {
  const enumMap = {};

  Object.keys(enums).map(function (enumName) {
    const enumList = enums[enumName];

    enumMap[enumName] = Object.keys(enumList).map(function (key) {
      return {
        name: key,
        description: enumList[key],
      };
    });
  });

  return enumMap;
}

function formatMethodThing(methodObj, key) {
  const response = methodObj[key];

  let resourceObject;
  if (typeof response === 'string') {
    const resourceName = response;

    // Paginated endpoints will modify the schema, so we need to be using a copy of the data.
    resourceObject = _.cloneDeep(getResourceObjByName(resourceName));
  } else {
    resourceObject = { schema: response };
  }

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
      try {
        resourceObject.schema = formatSchema(
          schema, enumMap, methodObj.paginationKey, methodObj.response);
      } catch (e) {
        throw new Error(`Error rendering object '${response}':\n${e.message}`);
      }
      resourceObject.example = formatSchemaExample(resourceObject.schema, methodObj.paginationKey);
    }
  }

  return resourceObject;
}

function formatMethod(endpoint, method) {
  const methodObj = endpoint.methods[method];

  const params = formatMethodThing(methodObj, 'params');
  const response = formatMethodThing(methodObj, 'response');

  const examples = formatMethodExamples(methodObj, params.example);

  return _.merge({}, methodObj, {
    name: method,
    examples,
    params: params,
    response: response,
  });
}

// map and nest
const endpointMap = {
  linodes: {
    name: 'Linodes',
    path: '/linode',
    routePath: `${ROUTE_BASE_PATH}/linode`,
    groups: {},
  },
  domains: {
    name: 'Domains',
    path: '/domains',
    routePath: `${ROUTE_BASE_PATH}/domains`,
    groups: {},
  },
  nodebalancers: {
    name: 'NodeBalancers',
    path: '/nodebalancers',
    routePath: `${ROUTE_BASE_PATH}/nodebalancers`,
    groups: {},
  },
  networking: {
    name: 'Networking',
    path: '/networking',
    routePath: `${ROUTE_BASE_PATH}/networking`,
    groups: {},
  },
  regions: {
    name: 'Regions',
    path: '/regions',
    routePath: `${ROUTE_BASE_PATH}/regions`,
    groups: {},
  },
  support: {
    name: 'Support',
    path: '/support',
    routePath: `${ROUTE_BASE_PATH}/support`,
    groups: {},
  },
  account: {
    name: 'Account',
    path: '/account',
    routePath: `${ROUTE_BASE_PATH}/account`,
    groups: {},
  },
  profile: {
    name: 'Profile',
    path: '/profile',
    routePath: `${ROUTE_BASE_PATH}/profile`,
    groups: {},
  },
};

allEndpoints.forEach(function (endpointContainer) {
  const containerName = endpointContainer.name.toLowerCase();
  const rawEndpoints = endpointContainer.endpoints;

  if (!rawEndpoints) {
    throw new Error(`No endpoints defined in ${containerName}, define at least 1 endpoint.`);
  }

  const endpoints = Object.keys(rawEndpoints).map(function (path) {
    const endpoint = rawEndpoints[path];

    let methods = null;
    if (endpoint.methods) {
      methods = Object.keys(endpoint.methods).map(function (method) {
        try {
          return formatMethod(endpoint, method);
        } catch (e) {
          const msg = `Error rendering api.js for ${method} of ${path} in
 ${endpointContainer.name}:\n${e.message}\n\n`;
          throw new Error(msg);
        }
      });
    }

    return _.merge(endpoint, {
      path: path,
      routePath: `${ROUTE_BASE_PATH}/endpoints${path}`,
      methods: methods,
    });
  });

  // map groups from endpoint definitions, pushing each endpoint into it's group
  endpoints.forEach(function (endpoint) {
    if (!endpoint.group) {
      // eslint-disable-next-line no-param-reassign
      endpoint.group = '';
    }

    if (!endpointMap[containerName]) {
      throw new Error(`'${containerName}' undefined in the endpoint map.
 Check the file name against the endpointMap in prebuild.`);
    }

    if (!endpointMap[containerName].groups[endpoint.group]) {
      endpointMap[containerName].groups[endpoint.group] = {
        label: endpoint.group,
        endpoints: [],
      };
    }

    endpointMap[containerName].groups[endpoint.group].endpoints.push(endpoint);
  });
});

// convert to arrays and sort
allEndpoints = Object.keys(endpointMap).map(function (key) {
  const endpointIndex = endpointMap[key];

  // alphabetically sort groups and endpoints in groups
    const t = _.assign(endpointIndex,  {
    groups: _.sortBy(endpointIndex.groups, g => g.label.toLowerCase()).map(
        group => _.assign(group, {
          endpoints: _.sortBy(group.endpoints, 'path'),
      })),
  });
    return t;
}).filter(Boolean);

const data = JSON.stringify(allEndpoints, null, 2);
const endpointModule = `
  /**
  *   Generated Docs Source -- DO NOT EDIT
  */
  module.exports = { indices: ${data} };
`;
fs.writeFileSync(path.join('./src', 'api.js'), endpointModule);

/**
 *   Convert Python YAML docs to JSON js objects
 */

function convertPythonYaml() {
  const pythonObjects = pythonFiles.filter(function (fileName) {
    return path.extname(fileName) === '.yaml';
  }).map(function (fileName) {
    const filePath = path.join(pythonPath, fileName);
    const pythonObject = yaml.safeLoad(fs.readFileSync(filePath, 'utf-8'), { json: true });

    return pythonObject;
  });

  const pythonObjectMap = {
    LinodeLoginClient: {
      name: 'LinodeLoginClient',
      path: '/linode-login-client',
      langauge: 'python',
      routePath: '/v4/libraries/python/linode-login-client',
      formattedPythonObject: [],
    },
    LinodeClient: {
      name: 'LinodeClient',
      path: '/linode-client',
      langauge: 'python',
      routePath: '/v4/libraries/python/linode-client',
      formattedPythonObject: [],
    },
    Linode: {
      name: 'Linode',
      path: '/linode',
      langauge: 'python',
      routePath: '/v4/libraries/python/linode',
      formattedPythonObject: [],
    },
    Config: {
      name: 'Config',
      path: '/config',
      langauge: 'python',
      routePath: '/v4/libraries/python/config',
      formattedPythonObject: [],
    },
    Disk: {
      name: 'Disk',
      path: '/disk',
      langauge: 'python',
      routePath: '/v4/libraries/python/disk',
      formattedPythonObject: [],
    },
    Region: {
      name: 'Region',
      path: '/region',
      langauge: 'python',
      routePath: '/v4/libraries/python/region',
      formattedPythonObject: [],
    },
    Distribution: {
      name: 'Distribution',
      path: '/distribution',
      langauge: 'python',
      routePath: '/v4/libraries/python/distribution',
      formattedPythonObject: [],
    },
    Backup: {
      name: 'Backup',
      path: '/backup',
      langauge: 'python',
      routePath: '/v4/libraries/python/backup',
      formattedPythonObject: [],
    },
    IPAddress: {
      name: 'IPAddress',
      path: '/ipaddress',
      langauge: 'python',
      routePath: '/v4/libraries/python/ipaddress',
      formattedPythonObject: [],
    },
    IPv6Address: {
      name: 'IPv6Address',
      path: '/ipv6address',
      langauge: 'python',
      routePath: '/v4/libraries/python/ipv6address',
      formattedPythonObject: [],
    },
    Kernel: {
      name: 'Kernel',
      path: '/kernel',
      langauge: 'python',
      routePath: '/v4/libraries/python/kernel',
      formattedPythonObject: [],
    },
    Service: {
      name: 'Service',
      path: '/service',
      langauge: 'python',
      routePath: '/v4/libraries/python/service',
      formattedPythonObject: [],
    },
    StackScript: {
      name: 'StackScript',
      path: '/stackscript',
      langauge: 'python',
      routePath: '/v4/libraries/python/stackscript',
      formattedPythonObject: [],
    },
    Domain: {
      name: 'Domain',
      path: '/domain',
      langauge: 'python',
      routePath: '/v4/libraries/python/domain',
      formattedPythonObject: [],
    },
    'Domain Record': {
      name: 'Domain Record',
      path: '/domain-record',
      langauge: 'python',
      routePath: '/v4/libraries/python/domain-record',
      formattedPythonObject: [],
    },
  };

  pythonObjects.forEach(function (pythonObject) {
    if (pythonObjectMap[pythonObject.name]) {
      pythonObjectMap[pythonObject.name].formattedPythonObject = pythonObject;
    }
  });
  const data = JSON.stringify(pythonObjectMap, null, 2);
  const pythonModule = `module.exports = { pythonObjects: ${data} };`;
  fs.writeFileSync(path.join('./src', 'python.js'), pythonModule);
}
convertPythonYaml();

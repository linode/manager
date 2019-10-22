import { array, boolean, mixed, number, object, string } from 'yup';

import { NodeBalancerConfig } from './types';

export const nodeBalancerConfigNodeSchema = object({
  label: string()
    .matches(
      /^[a-zA-Z0-9.\-_]+$/,
      'Label may only contain letters, numbers, periods, dashes, and underscores.'
    )
    .min(3, 'Label should be between 3 and 32 characters.')
    .max(32, 'Label should be between 3 and 32 characters.')
    .required('Label is required.'),

  address: string()
    .matches(
      /**
       * The API wants the port and address as a combined value here
       * e.g 192.168.12.12:80
       */
      /^192\.168\.\d{1,3}\.\d{1,3}\:\d{1,5}$/,
      'Must be a valid private IPv4 address with a specified port.'
    )
    .required('IP address is required.'),

  weight: number()
    .typeError('Weight must be a number.')
    .min(1, `Weight must be between 1 and 255.`)
    .max(255, `Weight must be between 1 and 255.`),

  mode: mixed().oneOf(['accept', 'reject', 'backup', 'drain'])
});

export const createNodeBalancerConfigSchema = object({
  algorithm: mixed().oneOf(['roundrobin', 'leastconn', 'source']),
  check_attempts: number(),
  check_body: string().when('check', {
    is: check => check === 'http_body',
    then: string().required()
  }),
  check_interval: number().typeError('Check interval must be a number.'),
  check_passive: boolean(),
  check_path: string()
    .matches(/\/.*/)
    .when('check', {
      is: check => check === 'http',
      then: string().required()
    })
    .when('check', {
      is: check => check === 'http_body',
      then: string().required()
    }),
  check_timeout: number()
    .typeError('Timeout must be a number.')
    .integer(),
  check: mixed().oneOf(['none', 'connection', 'http', 'http_body']),
  cipher_suite: mixed().oneOf(['recommended', 'legacy']),
  port: number()
    .integer()
    .required('Port is required')
    .min(1, 'Port must be between 1 and 65535.')
    .max(65535, 'Port must be between 1 and 65535.'),
  protocol: mixed().oneOf(['http', 'https', 'tcp']),
  ssl_key: string().when('protocol', {
    is: protocol => protocol === 'https',
    then: string().required('SSL key is required when using HTTPS.')
  }),
  ssl_cert: string().when('protocol', {
    is: protocol => protocol === 'https',
    then: string().required('SSL certificate is required when using HTTPS.')
  }),
  stickiness: mixed().oneOf(['none', 'table', 'http_cookie']),
  nodes: array()
    .of(nodeBalancerConfigNodeSchema)
    .required()
    .min(1, 'You must provide at least one back end node.')
});

export const UpdateNodeBalancerConfigSchema = object({
  algorithm: mixed().oneOf(['roundrobin', 'leastconn', 'source']),
  check_attempts: number(),
  check_body: string().when('check', {
    is: check => check === 'http_body',
    then: string().required()
  }),
  check_interval: number().typeError('Check interval must be a number.'),
  check_passive: boolean(),
  check_path: string()
    .matches(/\/.*/)
    .when('check', {
      is: check => check === 'http',
      then: string().required()
    })
    .when('check', {
      is: check => check === 'http_body',
      then: string().required()
    }),
  check_timeout: number()
    .typeError('Timeout must be a number.')
    .integer(),
  check: mixed().oneOf(['none', 'connection', 'http', 'http_body']),
  cipher_suite: mixed().oneOf(['recommended', 'legacy']),
  port: number()
    .typeError('Port must be a number.')
    .integer()
    .min(1, 'Port must be between 1 and 65535.')
    .max(65535, 'Port must be between 1 and 65535.'),
  protocol: mixed().oneOf(['http', 'https', 'tcp']),
  ssl_key: string().when('protocol', {
    is: protocol => protocol === 'https',
    then: string().required()
  }),
  ssl_cert: string().when('protocol', {
    is: protocol => protocol === 'https',
    then: string().required()
  }),
  stickiness: mixed().oneOf(['none', 'table', 'http_cookie']),
  nodes: array().of(nodeBalancerConfigNodeSchema)
});

export const NodeBalancerSchema = object({
  label: string()
    .min(3, 'Label must be between 3 and 32 characters.')
    .max(32, 'Label must be between 3 and 32 characters.')
    .matches(
      /^[a-zA-Z0-9-_]+$/,
      "Label can't contain special characters or spaces."
    ),

  client_conn_throttle: number().typeError('Must be a number.'),

  region: string().required('Region is required.'),

  configs: array()
    .of(createNodeBalancerConfigSchema)
    /* @todo there must be an easier way */
    .test('unique', 'Port must be unique.', function(
      values: NodeBalancerConfig[]
    ) {
      if (!values) {
        return true;
      }
      const ports: number[] = [];
      const configs = values.reduce(
        (prev: number[], value: NodeBalancerConfig, idx: number) => {
          if (!value.port) {
            return prev;
          }
          if (!ports.includes(value.port)) {
            ports.push(value.port);
            return prev;
          }
          return [...prev, idx];
        },
        []
      );
      if (configs.length === 0) {
        return true;
      } // No ports were duplicates
      const configStrings = configs.map(
        (config: number) => `configs[${config}].port`
      );
      throw this.createError({
        path: configStrings.join('|'),
        message: 'Port must be unique.'
      });
    })
});

export const UpdateNodeBalancerSchema = object({
  label: string()
    .min(3, 'Label must be between 3 and 32 characters.')
    .max(32, 'Label must be between 3 and 32 characters.')
    .matches(
      /^[a-zA-Z0-9-_]+$/,
      "Label can't contain special characters or spaces."
    ),

  client_conn_throttle: number().typeError('Must be a number.'),

  region: string()
});

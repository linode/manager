import { array, boolean, number, object, string } from 'yup';

export const nodeBalancerConfigNodeSchema = object().shape({
  label: string()
    .min(3, 'Label should be between 3 and 32 characters.')
    .max(32, 'Label should be between 3 and 32 characters.')
    .required('Label is required.'),

  address: string()
    .matches(/^192\.168\.\d{1,3}\.\d{1,3}$/, 'Must be a valid IPv4 address.')
    .required('IP address is required.'),

  port: string()
    .matches(/^\d{1,5}$/)
    .required('Port is required.'),

  weight: number()
    .min(1, `Weight must be between 1 and 255.`)
    .max(255, `Weight must be between 1 and 255.`),

  mode: string()
    .oneOf(['accept', 'reject', 'drain'])
});

export const createNodeBalancerConfigSchema = object({
  algorithm: string(),
  check_attempts: number(),
  check_body: string()
    .when('check', { is: 'http_body', then: string().required() }),
  check_interval: number(),
  check_passive: boolean(),
  check_path: string().matches(/\/.*/)
    .when('check', { is: 'http', then: string().required() })
    .when('check', { is: 'http_body', then: string().required() }),
  check_timeout: number().integer(),
  check: string(),
  cipher_suite: string(),
  port: number().integer().min(1).max(65535).required(),
  protocol: string().oneOf(['http', 'https', 'tcp']),
  ssl_key: string()
    .when('protocol', { is: 'https', then: string()
      .required('SSL key is required when using HTTPS.') }),
  ssl_cert: string()
    .when('protocol', { is: 'https', then: string()
      .required('SSL certificate is required when using HTTPS.') }),
  stickiness: string(),
  nodes: array()
    .of(nodeBalancerConfigNodeSchema).required().min(1, "You must provide at least one back end node."),
});

export const UpdateNodeBalancerConfigSchema = object({
  algorithm: string(),
  check_attempts: number(),
  check_body: string()
    .when('check', { is: 'http_body', then: string().required() }),
  check_interval: number(),
  check_passive: boolean(),
  check_path: string().matches(/\/.*/)
    .when('check', { is: 'http', then: string().required() })
    .when('check', { is: 'http_body', then: string().required() }),
  check_timeout: number().integer(),
  check: string(),
  cipher_suite: string(),
  port: number().integer().min(1).max(65535),
  protocol: string().oneOf(['http', 'https', 'tcp']),
  ssl_key: string().when('protocol', { is: 'https', then: string().required() }),
  ssl_cert: string().when('protocol', { is: 'https', then: string().required() }),
  stickiness: string(),
  nodes: array().of(nodeBalancerConfigNodeSchema),
});

export const NodeBalancerSchema = object({
  label: string()
    .matches(/^[a-zA-Z0-9-_]+$/)
    .min(3)
    .max(32),

  client_conn_throttle: number(),

  region: string().required('Region is required.'),

  configs: array()
    .of(createNodeBalancerConfigSchema)
  /** How do I do unique... */
  // .unique((a, b) => a.port === b.port),
});

export const UpdateNodeBalancerSchema = object({
  label: string()
    .matches(/^[a-zA-Z0-9-_]+$/)
    .min(3)
    .max(32),

  client_conn_throttle: number(),

  region: string(),
});
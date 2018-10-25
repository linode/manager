import { array, boolean, mixed, number, object, string } from 'yup';

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

  mode: mixed()
    .oneOf(['accept', 'reject', 'drain'])
});

export const createNodeBalancerConfigSchema = object({
  algorithm: mixed().oneOf(["roundrobin", "leastconn", "source"]),
  check_attempts: number(),
  check_body: string()
    .when('check', { is: 'http_body', then: string().required() }),
  check_interval: number(),
  check_passive: boolean(),
  check_path: string().matches(/\/.*/)
    .when('check', { is: 'http', then: string().required() })
    .when('check', { is: 'http_body', then: string().required() }),
  check_timeout: number().integer(),
  check: mixed().oneOf(["none", "connection", "http", "http_body"]),
  cipher_suite: mixed().oneOf(["recommended", "legacy"]),
  port: number().integer().min(1).max(65535).required('Port is required'),
  protocol: mixed().oneOf(['http', 'https', 'tcp']),
  ssl_key: string()
    .when('protocol', { is: 'https', then: string()
      .required('SSL key is required when using HTTPS.') }),
  ssl_cert: string()
    .when('protocol', { is: 'https', then: string()
      .required('SSL certificate is required when using HTTPS.') }),
  stickiness: mixed().oneOf(["none", "table", "http_cookie"]),
  nodes: array()
    .of(nodeBalancerConfigNodeSchema).required().min(1, "You must provide at least one back end node."),
});

export const UpdateNodeBalancerConfigSchema = object({
  algorithm: mixed().oneOf(["roundrobin", "leastconn", "source"]),
  check_attempts: number(),
  check_body: string()
    .when('check', { is: 'http_body', then: string().required() }),
  check_interval: number(),
  check_passive: boolean(),
  check_path: string().matches(/\/.*/)
    .when('check', { is: 'http', then: string().required() })
    .when('check', { is: 'http_body', then: string().required() }),
  check_timeout: number().integer(),
  check: mixed().oneOf(["none", "connection", "http", "http_body"]),
  cipher_suite: mixed().oneOf(["recommended", "legacy"]),
  port: number().integer().min(1).max(65535),
  protocol: mixed().oneOf(['http', 'https', 'tcp']),
  ssl_key: string().when('protocol', { is: 'https', then: string().required() }),
  ssl_cert: string().when('protocol', { is: 'https', then: string().required() }),
  stickiness: mixed().oneOf(["none", "table", "http_cookie"]),
  nodes: array().of(nodeBalancerConfigNodeSchema),
});

export const NodeBalancerSchema = object({
  label: string()
    .matches(/^[a-zA-Z0-9-_]+$/, "Label can't contain special characters.")
    .min(3, "Label must be between 3 and 32 characters.")
    .max(32, "Label must be between 3 and 32 characters."),

  client_conn_throttle: number(),

  region: string().required('Region is required.'),

  configs: array()
    .of(createNodeBalancerConfigSchema)
  /** How do I do unique... */
  // .unique((a, b) => a.port === b.port),
});

export const UpdateNodeBalancerSchema = object({
  label: string()
    .matches(/^[a-zA-Z0-9-_]+$/, "Label can't contain special characters.")
    .min(3, "Label must be between 3 and 32 characters.")
    .max(32, "Label must be between 3 and 32 characters."),

  client_conn_throttle: number(),

  region: string(),
});
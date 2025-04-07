import { array, boolean, lazy, mixed, number, object, string } from 'yup';
import { IP_EITHER_BOTH_NOT_NEITHER, vpcsValidateIP } from './vpcs.schema';

const PORT_WARNING = 'Port must be between 1 and 65535.';
const LABEL_WARNING = 'Label must be between 3 and 32 characters.';
const PRIVATE_IPv4_WARNING = 'Must be a valid private IPv4 address.';

export const PRIVATE_IPv4_REGEX = /^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/;
export const PRIVATE_IPv6_REGEX = /^(fc|fd)\./;

export const CHECK_ATTEMPTS = {
  MIN: 1,
  MAX: 30,
};

export const CHECK_TIMEOUT = {
  MIN: 1,
  MAX: 30,
};

export const CHECK_INTERVAL = {
  MIN: 2,
  MAX: 3600,
};

const CONNECTION_THROTTLE = {
  MIN: 0,
  MAX: 20,
};

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
    .typeError('IP address is required.')
    .required('IP address is required.')
    .matches(PRIVATE_IPv4_REGEX, PRIVATE_IPv4_WARNING),

  subnet_id: number().when('vpcs', {
    is: (vpcs: typeof createNodeBalancerVPCsSchema) => vpcs !== undefined,
    then: (schema) =>
      schema
        .required('Subnet ID is required')
        .typeError('Subnet ID must be a number'),
  }),

  port: number()
    .typeError('Port must be a number.')
    .required('Port is required.')
    .min(1, PORT_WARNING)
    .max(65535, PORT_WARNING),

  weight: number()
    .typeError('Weight must be a number.')
    .min(1, `Weight must be between 1 and 255.`)
    .max(255, `Weight must be between 1 and 255.`),

  mode: string().oneOf(['accept', 'reject', 'backup', 'drain']),
});

export const createNodeBalancerConfigSchema = object({
  algorithm: string().when('protocol', {
    is: 'udp',
    then: (schema) => schema.oneOf(['roundrobin', 'leastconn', 'ring_hash']),
    otherwise: (schema) => schema.oneOf(['roundrobin', 'leastconn', 'source']),
  }),
  check_attempts: number()
    .min(
      CHECK_ATTEMPTS.MIN,
      `Attempts should be greater than or equal to ${CHECK_ATTEMPTS.MIN}.`
    )
    .max(
      CHECK_ATTEMPTS.MAX,
      `Attempts should be less than or equal to ${CHECK_ATTEMPTS.MAX}.`
    )
    .integer(),
  check_body: string().when('check', {
    is: 'http_body',
    then: (schema) => schema.required('An HTTP body regex is required.'),
  }),
  check_interval: number()
    .min(
      CHECK_INTERVAL.MIN,
      `Interval should be greater than or equal to ${CHECK_INTERVAL.MIN}.`
    )
    .max(
      CHECK_INTERVAL.MAX,
      `Interval should be less than or equal to ${CHECK_INTERVAL.MAX}.`
    )
    .typeError('Interval must be a number.')
    .integer(),
  check_passive: boolean().when('protocol', {
    is: 'udp',
    then: (schema) => schema.isFalse(), // You can't enable check_passtive with UDP
  }),
  check_path: string()
    .matches(/\/.*/)
    .when('check', {
      is: 'http',
      then: (schema) => schema.required('An HTTP path is required.'),
    })
    .when('check', {
      is: 'http_body',
      then: (schema) => schema.required('An HTTP path is required.'),
    }),
  proxy_protocol: string().when('protocol', {
    is: 'udp',
    then: (schema) => schema.oneOf(['none']), // UDP does not support proxy_protocol
    otherwise: (schema) => schema.oneOf(['none', 'v1', 'v2']),
  }),
  check_timeout: number()
    .min(
      CHECK_TIMEOUT.MIN,
      `Timeout should be greater than or equal to ${CHECK_TIMEOUT.MIN}.`
    )
    .max(
      CHECK_TIMEOUT.MAX,
      `Timeout should be less than or equal to ${CHECK_TIMEOUT.MAX}.`
    )
    .typeError('Timeout must be a number.')
    .integer(),
  check: mixed().oneOf(['none', 'connection', 'http', 'http_body']),
  cipher_suite: string().oneOf(['recommended', 'legacy', 'none']),
  port: number()
    .integer()
    .required('Port is required')
    .min(1, PORT_WARNING)
    .max(65535, PORT_WARNING),
  protocol: string().oneOf(['http', 'https', 'tcp', 'udp']),
  ssl_key: string().when('protocol', {
    is: 'https',
    then: (schema) => schema.required('SSL key is required when using HTTPS.'),
  }),
  ssl_cert: string().when('protocol', {
    is: 'https',
    then: (schema) =>
      schema.required('SSL certificate is required when using HTTPS.'),
  }),
  stickiness: string().when('protocol', {
    is: 'udp',
    then: (schema) => schema.oneOf(['none', 'source_ip', 'session']),
    otherwise: (schema) => schema.oneOf(['none', 'table', 'http_cookie']),
  }),
  udp_check_port: number().min(1).max(65535),
  nodes: array()
    .of(nodeBalancerConfigNodeSchema)
    .required()
    .min(1, 'You must provide at least one back end node.'),
});

export const UpdateNodeBalancerConfigSchema = object({
  algorithm: string().when('protocol', {
    is: 'udp',
    then: (schema) => schema.oneOf(['roundrobin', 'leastconn', 'ring_hash']),
    otherwise: (schema) => schema.oneOf(['roundrobin', 'leastconn', 'source']),
  }),
  check_attempts: number()
    .min(
      CHECK_ATTEMPTS.MIN,
      `Attempts should be greater than or equal to ${CHECK_ATTEMPTS.MIN}.`
    )
    .max(
      CHECK_ATTEMPTS.MAX,
      `Attempts should be less than or equal to ${CHECK_ATTEMPTS.MAX}.`
    )
    .integer(),
  check_body: string().when('check', {
    is: 'http_body',
    then: (schema) => schema.required('An HTTP body regex is required.'),
  }),
  check_interval: number()
    .min(
      CHECK_INTERVAL.MIN,
      `Interval should be greater than or equal to ${CHECK_INTERVAL.MIN}.`
    )
    .max(
      CHECK_INTERVAL.MAX,
      `Interval should be less than or equal to ${CHECK_INTERVAL.MAX}.`
    )
    .typeError('Interval must be a number.')
    .integer(),
  check_passive: boolean().when('protocol', {
    is: 'udp',
    then: (schema) => schema.isFalse(), // You can't enable check_passtive with UDP
  }),
  check_path: string()
    .matches(/\/.*/)
    .when('check', {
      is: 'http',
      then: (schema) => schema.required('An HTTP path is required.'),
    })
    .when('check', {
      is: 'http_body',
      then: (schema) => schema.required('An HTTP path is required.'),
    }),
  proxy_protocol: string().when('protocol', {
    is: 'udp',
    then: (schema) => schema.oneOf(['none']), // UDP does not support proxy_protocol
    otherwise: (schema) => schema.oneOf(['none', 'v1', 'v2']),
  }),
  check_timeout: number()
    .min(
      CHECK_TIMEOUT.MIN,
      `Timeout should be greater than or equal to ${CHECK_TIMEOUT.MIN}.`
    )
    .max(
      CHECK_TIMEOUT.MAX,
      `Timeout should be less than or equal to ${CHECK_TIMEOUT.MAX}.`
    )
    .typeError('Timeout must be a number.')
    .integer(),
  check: mixed().oneOf(['none', 'connection', 'http', 'http_body']),
  cipher_suite: string().oneOf(['recommended', 'legacy', 'none']),
  port: number()
    .typeError('Port must be a number.')
    .integer()
    .min(1, PORT_WARNING)
    .max(65535, PORT_WARNING),
  protocol: string().oneOf(['http', 'https', 'tcp', 'udp']),
  ssl_key: string().when('protocol', {
    is: 'https',
    then: (schema) => schema.required(),
  }),
  ssl_cert: string().when('protocol', {
    is: 'https',
    then: (schema) => schema.required(),
  }),
  udp_check_port: number().min(1).max(65535),
  stickiness: string().when('protocol', {
    is: 'udp',
    then: (schema) => schema.oneOf(['none', 'source_ip', 'session']),
    otherwise: (schema) => schema.oneOf(['none', 'table', 'http_cookie']),
  }),
});

const client_conn_throttle = number()
  .min(
    CONNECTION_THROTTLE.MIN,
    `Client Connection Throttle must be between ${CONNECTION_THROTTLE.MIN} and ${CONNECTION_THROTTLE.MAX}.`
  )
  .max(
    CONNECTION_THROTTLE.MAX,
    `Client Connection Throttle must be between ${CONNECTION_THROTTLE.MIN} and ${CONNECTION_THROTTLE.MAX}.`
  )
  .typeError('Client Connection Throttle must be a number.');

const client_udp_sess_throttle = number()
  .min(
    CONNECTION_THROTTLE.MIN,
    `UDP Session Throttle must be between ${CONNECTION_THROTTLE.MIN} and ${CONNECTION_THROTTLE.MAX}.`
  )
  .max(
    CONNECTION_THROTTLE.MAX,
    `UDP Session Throttle must be between ${CONNECTION_THROTTLE.MIN} and ${CONNECTION_THROTTLE.MAX}.`
  )
  .typeError('UDP Session Throttle must be a number.');

const createNodeBalancerVPCsSchema = object().shape(
  {
    subnet_id: number()
      .typeError('Subnet ID must be a number.')
      .required('Subnet ID is required.'),
    ipv4_range: string().when('ipv6_range', {
      is: (value: unknown) =>
        value === '' || value === null || value === undefined,
      then: (schema) =>
        schema
          .required(IP_EITHER_BOTH_NOT_NEITHER)
          .matches(PRIVATE_IPv4_REGEX, PRIVATE_IPv4_WARNING)
          .test({
            name: 'IPv4 CIDR format',
            message: 'The IPv4 range must be in CIDR format.',
            test: (value) =>
              vpcsValidateIP({
                value,
                shouldHaveIPMask: true,
                mustBeIPMask: false,
              }),
          }),
      otherwise: (schema) =>
        lazy((value: string | undefined) => {
          switch (typeof value) {
            case 'undefined':
              return schema.notRequired().nullable();

            case 'string':
              return schema
                .notRequired()
                .matches(PRIVATE_IPv4_REGEX, PRIVATE_IPv4_WARNING)
                .test({
                  name: 'IPv4 CIDR format',
                  message: 'The IPv4 range must be in CIDR format.',
                  test: (value) =>
                    vpcsValidateIP({
                      value,
                      shouldHaveIPMask: true,
                      mustBeIPMask: false,
                    }),
                });

            default:
              return schema.notRequired().nullable();
          }
        }),
    }),
    ipv6_range: string().when('ipv4_range', {
      is: (value: unknown) =>
        value === '' || value === null || value === undefined,
      then: (schema) =>
        schema
          .required(IP_EITHER_BOTH_NOT_NEITHER)
          .matches(PRIVATE_IPv6_REGEX, 'Must be a valid private IPv6 address.')
          .test({
            name: 'valid-ipv6-range',
            message:
              'Must be a valid IPv6 range, e.g. 2001:db8:abcd:0012::0/64.',
            test: (value) =>
              vpcsValidateIP({
                value,
                shouldHaveIPMask: true,
                mustBeIPMask: false,
              }),
          }),
    }),
  },
  [
    ['ipv4_range', 'ipv6_range'],
    ['ipv6_range', 'ipv4_range'],
  ]
);

export const NodeBalancerSchema = object({
  label: string()
    .required('Label is required.')
    .min(3, LABEL_WARNING)
    .max(32, LABEL_WARNING)
    .matches(
      /^[a-zA-Z0-9-_]+$/,
      "Label can't contain special characters or spaces."
    ),

  client_conn_throttle,

  client_udp_sess_throttle,

  tags: array(string()),

  region: string().required('Region is required.'),

  configs: array()
    .of(createNodeBalancerConfigSchema)
    /* @todo there must be an easier way */
    .test('unique', 'Port must be unique.', function (value?: any[] | null) {
      if (!value) {
        return true;
      }
      const ports: number[] = [];
      const configs = value.reduce(
        (prev: number[], value: any, idx: number) => {
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
        message: 'Port must be unique.',
      });
    }),

  vpcs: array()
    .of(createNodeBalancerVPCsSchema)
    .test(
      'unique subnet IDs',
      'Subnet IDs must be unique.',
      function (value?: any[] | null) {
        if (!value) {
          return true;
        }
        const ids: number[] = value.map((vpcs) => vpcs.subnet_id);
        const duplicates: number[] = [];
        ids.forEach(
          (id, index) => ids.indexOf(id) !== index && duplicates.push(index)
        );
        const idStrings = ids.map((id: number) => `vpcs[${id}].subnet_id`);
        throw this.createError({
          path: idStrings.join('|'),
          message: 'Subnet ID must be unique',
        });
      }
    ),
});

export const UpdateNodeBalancerSchema = object({
  label: string()
    .min(3, LABEL_WARNING)
    .max(32, LABEL_WARNING)
    .matches(
      /^[a-zA-Z0-9-_]+$/,
      "Label can't contain special characters or spaces."
    ),
  client_conn_throttle,
  client_udp_sess_throttle,
  tags: array(string()),
});

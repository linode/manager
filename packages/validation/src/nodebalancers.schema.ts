import {
  array,
  boolean,
  mixed,
  number,
  object,
  string,
  ValidationError,
} from 'yup';

import { determineIPType, vpcsValidateIP } from './vpcs.schema';

const PORT_WARNING = 'Port must be between 1 and 65535.';
const LABEL_WARNING = 'Label must be between 3 and 32 characters.';
const PRIVATE_IPV4_WARNING = 'Must be a valid private IPv4 address.';

export const PRIVATE_IPV4_REGEX =
  /^10\.|^172\.1[6-9]\.|^172\.2\d\.|^172\.3[0-1]\.|^192\.168\.|^fd/;
// The regex to capture private IPv6 isn't comprehensive of all possible cases. Currently, we just match for the first block.
export const PRIVATE_IPV6_REGEX = /^(fc|fd)[0-9a-f]{2}/;

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
      'Label may only contain letters, numbers, periods, dashes, and underscores.',
    )
    .min(3, 'Label should be between 3 and 32 characters.')
    .max(32, 'Label should be between 3 and 32 characters.')
    .required('Label is required.'),

  address: string()
    .typeError('IP address is required.')
    .required('IP address is required.')
    .test(
      'IP validation',
      'Must be a private IPv4 or a valid IPv6 address',
      function (value) {
        const type = determineIPType(value);
        const isIPv4 = type === 'ipv4';
        const isIPv6 = type === 'ipv6';

        if (!isIPv4 && !isIPv6) {
          // @TODO- NB Dual Stack Support(IPv6): Edit the error message to cover IPv6 addresses
          return this.createError({
            message: PRIVATE_IPV4_WARNING,
          });
        }

        if (isIPv4) {
          if (!PRIVATE_IPV4_REGEX.test(value)) {
            return this.createError({
              message: PRIVATE_IPV4_WARNING,
            });
          }
          return true;
        }

        if (isIPv6) {
          return true;
        }

        return this.createError({
          message: 'Unexpected error during IP address validation',
        });
      },
    ),

  subnet_id: number().when('vpcs', {
    is: (vpcs: (typeof createNodeBalancerVPCsSchema)[]) => vpcs !== undefined,
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
      `Attempts should be greater than or equal to ${CHECK_ATTEMPTS.MIN}.`,
    )
    .max(
      CHECK_ATTEMPTS.MAX,
      `Attempts should be less than or equal to ${CHECK_ATTEMPTS.MAX}.`,
    )
    .integer(),
  check_body: string().when('check', {
    is: 'http_body',
    then: (schema) => schema.required('An HTTP body regex is required.'),
  }),
  check_interval: number()
    .min(
      CHECK_INTERVAL.MIN,
      `Interval should be greater than or equal to ${CHECK_INTERVAL.MIN}.`,
    )
    .max(
      CHECK_INTERVAL.MAX,
      `Interval should be less than or equal to ${CHECK_INTERVAL.MAX}.`,
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
      `Timeout should be greater than or equal to ${CHECK_TIMEOUT.MIN}.`,
    )
    .max(
      CHECK_TIMEOUT.MAX,
      `Timeout should be less than or equal to ${CHECK_TIMEOUT.MAX}.`,
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
  protocol: string<'http' | 'https' | 'tcp' | 'udp'>().oneOf([
    'http',
    'https',
    'tcp',
    'udp',
  ]),
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
      `Attempts should be greater than or equal to ${CHECK_ATTEMPTS.MIN}.`,
    )
    .max(
      CHECK_ATTEMPTS.MAX,
      `Attempts should be less than or equal to ${CHECK_ATTEMPTS.MAX}.`,
    )
    .integer(),
  check_body: string().when('check', {
    is: 'http_body',
    then: (schema) => schema.required('An HTTP body regex is required.'),
  }),
  check_interval: number()
    .min(
      CHECK_INTERVAL.MIN,
      `Interval should be greater than or equal to ${CHECK_INTERVAL.MIN}.`,
    )
    .max(
      CHECK_INTERVAL.MAX,
      `Interval should be less than or equal to ${CHECK_INTERVAL.MAX}.`,
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
      `Timeout should be greater than or equal to ${CHECK_TIMEOUT.MIN}.`,
    )
    .max(
      CHECK_TIMEOUT.MAX,
      `Timeout should be less than or equal to ${CHECK_TIMEOUT.MAX}.`,
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

const clientConnThrottle = number()
  .min(
    CONNECTION_THROTTLE.MIN,
    `Client Connection Throttle must be between ${CONNECTION_THROTTLE.MIN} and ${CONNECTION_THROTTLE.MAX}.`,
  )
  .max(
    CONNECTION_THROTTLE.MAX,
    `Client Connection Throttle must be between ${CONNECTION_THROTTLE.MIN} and ${CONNECTION_THROTTLE.MAX}.`,
  )
  .typeError('Client Connection Throttle must be a number.');

const clientUdpSessThrottle = number()
  .min(
    CONNECTION_THROTTLE.MIN,
    `UDP Session Throttle must be between ${CONNECTION_THROTTLE.MIN} and ${CONNECTION_THROTTLE.MAX}.`,
  )
  .max(
    CONNECTION_THROTTLE.MAX,
    `UDP Session Throttle must be between ${CONNECTION_THROTTLE.MIN} and ${CONNECTION_THROTTLE.MAX}.`,
  )
  .typeError('UDP Session Throttle must be a number.');

const createNodeBalancerVPCsSchema = object().shape({
  subnet_id: number()
    .typeError('Subnet ID must be a number.')
    .required('Subnet ID is required.'),
  ipv4_range: string()
    .notRequired()
    .matches(PRIVATE_IPV4_REGEX, PRIVATE_IPV4_WARNING)
    .test({
      name: 'IPv4 CIDR format',
      message: 'The IPv4 range must be in CIDR format.',
      test: (value) =>
        !value ||
        vpcsValidateIP({
          value,
          shouldHaveIPMask: true,
          mustBeIPMask: false,
        }),
    }),
  ipv6_range: string()
    .notRequired()
    .matches(PRIVATE_IPV6_REGEX, 'Must be a valid private IPv6 address.')
    .test({
      name: 'valid-ipv6-range',
      message:
        'Must be a valid private IPv6 range, e.g. fd12:3456:789a:1::1/64.',
      test: (value) =>
        !value ||
        vpcsValidateIP({
          value,
          shouldHaveIPMask: true,
          mustBeIPMask: false,
        }),
    }),
});

const getProtocolFamilyFromProtcol = (
  protocol: 'http' | 'https' | 'tcp' | 'udp',
): 'tcp' | 'udp' => {
  if (protocol === 'udp') {
    return 'udp';
  }
  return 'tcp';
};

export const NodeBalancerSchema = object({
  label: string()
    .required('Label is required.')
    .min(3, LABEL_WARNING)
    .max(32, LABEL_WARNING)
    .matches(
      /^[a-zA-Z0-9-_]+$/,
      "Label can't contain special characters or spaces.",
    ),

  clientConnThrottle,

  clientUdpSessThrottle,

  tags: array(string()),

  region: string().required('Region is required.'),

  configs: array()
    .of(createNodeBalancerConfigSchema)
    .test('unique', 'Port must be unique.', function (configs) {
      if (!configs) {
        return true;
      }
      const indexsOfConfigsWithNonUniquePort: number[] = [];

      for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        if (
          configs.some(
            (c, index) =>
              c.port &&
              c.protocol &&
              config.protocol &&
              config.port &&
              c.port === config.port &&
              getProtocolFamilyFromProtcol(c.protocol) ===
                getProtocolFamilyFromProtcol(config.protocol) &&
              index !== i,
          )
        ) {
          indexsOfConfigsWithNonUniquePort.push(i);
        }
      }

      if (indexsOfConfigsWithNonUniquePort.length === 0) {
        return true;
      }

      return new ValidationError(
        indexsOfConfigsWithNonUniquePort.map(
          (configIndex) =>
            new ValidationError(
              `Port must be unique amongst ${getProtocolFamilyFromProtcol(configs[configIndex].protocol!) === 'tcp' ? 'TCP / HTTP / HTTPS' : 'UDP'} configurations.`,
              configs[configIndex].protocol,
              `configs[${configIndex}].port`,
            ),
        ),
      );
    }),

  vpcs: array()
    .of(createNodeBalancerVPCsSchema)
    .test('unique subnet IDs', 'Subnet IDs must be unique.', function (value) {
      if (!value) {
        return true;
      }
      const ids: number[] = value.map((vpcs) => vpcs.subnet_id);
      const duplicates: number[] = [];
      ids.forEach(
        (id, index) => ids.indexOf(id) !== index && duplicates.push(index),
      );
      if (duplicates.length === 0) {
        return true;
      }
      const idStrings = duplicates.map(
        (idx: number) => `vpcs[${idx}].subnet_id`,
      );
      throw this.createError({
        path: idStrings.join('|'),
        message: 'Subnet IDs must be unique',
      });
    }),
});

export const UpdateNodeBalancerSchema = object({
  label: string()
    .min(3, LABEL_WARNING)
    .max(32, LABEL_WARNING)
    .matches(
      /^[a-zA-Z0-9-_]+$/,
      "Label can't contain special characters or spaces.",
    ),
  clientConnThrottle,
  clientUdpSessThrottle,
  tags: array(string()),
});

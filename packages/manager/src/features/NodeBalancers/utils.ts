import { filter, isNil } from 'ramda';

import { getErrorMap } from 'src/utilities/errorUtils';

import { SESSION_STICKINESS_DEFAULTS } from './constants';

import type {
  NodeBalancerConfigFields,
  NodeBalancerConfigFieldsWithStatus,
  NodeBalancerConfigNodeFields,
} from './types';
import type {
  APIError,
  Algorithm,
  NodeBalancerConfigNode,
  Protocol,
  Stickiness,
} from '@linode/api-v4';

export const createNewNodeBalancerConfigNode = (): NodeBalancerConfigNodeFields => ({
  address: '',
  label: '',
  mode: 'accept',
  modifyStatus: 'new',
  port: 80,
  weight: 100,
});

export const createNewNodeBalancerConfig = (
  withDefaultPort?: boolean
): NodeBalancerConfigFieldsWithStatus => ({
  algorithm: 'roundrobin',
  check: 'none',
  check_attempts: 2,
  check_body: undefined,
  check_interval: 5,
  check_passive: true,
  check_path: undefined,
  check_timeout: 3,
  cipher_suite: undefined,
  modifyStatus: 'new',
  nodes: [createNewNodeBalancerConfigNode()],
  port: withDefaultPort ? 80 : undefined,
  protocol: 'http',
  proxy_protocol: 'none',
  ssl_cert: undefined,
  ssl_key: undefined,
  stickiness: SESSION_STICKINESS_DEFAULTS['http'],
});

export const getNodeForRequest = (
  node: NodeBalancerConfigNodeFields,
  config: NodeBalancerConfigFields
) => ({
  address: node.address,
  label: node.label,
  /**
   * `mode` should not be specified for UDP because UDP does not
   * support the various different modes.
   */
  mode: config.protocol !== 'udp' ? node.mode : undefined,
  port: node.port,
  weight: +node.weight!,
});

export const formatAddress = (node: NodeBalancerConfigNodeFields) => ({
  ...node,
  address: `${node.address}:${node.port}`,
});

export const parseAddress = (node: NodeBalancerConfigNode) => {
  const match = /^(192\.168\.\d{1,3}\.\d{1,3}):(\d{1,5})$/.exec(node.address);
  if (match) {
    return {
      ...node,
      address: match![1],
      port: match![2],
    };
  }
  return node;
};

export const parseAddresses = (nodes: NodeBalancerConfigNode[]) => {
  return nodes.map(parseAddress);
};

/* Transform an array of configs into valid request data.
   Does not modify in-place, returns a deep clone of the configs */
export const transformConfigsForRequest = (
  configs: NodeBalancerConfigFields[]
): NodeBalancerConfigFields[] => {
  return configs.map((config: NodeBalancerConfigFields) => {
    return (filter(
      /* remove the (key: value) pairs that we set to undefined */
      (el) => el !== undefined,
      {
        algorithm: config.algorithm || undefined,
        check: config.check || undefined,
        check_attempts: !isNil(config.check_attempts)
          ? +config.check_attempts
          : undefined,
        check_body: shouldIncludeCheckBody(config)
          ? config.check_body
          : undefined,
        check_interval: !isNil(config.check_interval)
          ? +config.check_interval
          : undefined,
        // Passive checks must be false for UDP
        check_passive: config.protocol === 'udp'
          ? false
          : config.check_passive,
        check_path: shouldIncludeCheckPath(config)
          ? config.check_path
          : undefined,
        check_timeout: !isNil(config.check_timeout)
          ? +config.check_timeout
          : undefined,
        cipher_suite: shouldIncludeCipherSuite(config)
          ? config.cipher_suite
          : undefined,
        id: undefined,
        nodebalancer_id: undefined,
        nodes: config.nodes.map((node) => getNodeForRequest(node, config)),
        nodes_status: undefined,
        port: config.port ? +config.port : undefined,
        protocol:
          /*
           * If the provided protocol is "https" and the cert and key are set
           * to "<REDACTED", don't try to set the protocol, it has already
           * been set to "https".
           */
          config.protocol === 'https' &&
          config.ssl_cert === '<REDACTED>' &&
          config.ssl_key === '<REDACTED>'
            ? undefined
            : config.protocol || undefined,
        proxy_protocol:
          config.protocol === 'tcp' ? config.proxy_protocol : 'none',
        ssl_cert:
          config.ssl_cert === '<REDACTED>'
            ? undefined
            : config.ssl_cert || undefined,
        ssl_commonname: undefined,
        ssl_fingerprint: undefined,
        ssl_key:
          config.ssl_key === '<REDACTED>'
            ? undefined
            : config.ssl_key || undefined,
        stickiness: config.stickiness || undefined,
        udp_check_port: config.udp_check_port,
      }
    ) as unknown) as NodeBalancerConfigFields;
  });
};

const shouldIncludeCipherSuite = (config: NodeBalancerConfigFields) => {
  return config.protocol !== 'udp';
};

export const shouldIncludeCheckPath = (config: NodeBalancerConfigFields) => {
  return (
    (config.check === 'http' || config.check === 'http_body') &&
    config.check_path
  );
};

export const shouldIncludeCheckBody = (config: NodeBalancerConfigFields) => {
  return config.check === 'http_body' && config.check_body;
};

// We don't want to end up with nodes[3].ip_address as errorMap.none
const filteredErrors = (errors: APIError[]) =>
  errors
    ? errors.filter(
        (thisError) =>
          !thisError.field || !thisError.field.match(/nodes\[[0-9+]\]/)
      )
    : [];

export const setErrorMap = (errors: APIError[]) =>
  getErrorMap(
    [
      'algorithm',
      'check_attempts',
      'check_body',
      'check_interval',
      'check_path',
      'check_timeout',
      'check',
      'configs',
      'port',
      'protocol',
      'proxy_protocol',
      'ssl_cert',
      'ssl_key',
      'stickiness',
      'nodes',
      'udp_check_port',
    ],
    filteredErrors(errors)
  );

interface AlgorithmOption {
  label: string;
  value: Algorithm;
}

export const getAlgorithmOptions = (protocol: Protocol): AlgorithmOption[] => {
  if (protocol === 'udp') {
    return [
      { label: 'Round Robin', value: 'roundrobin' },
      { label: 'Least Connections', value: 'leastconn' },
      { label: 'Ring Hash', value: 'ring_hash' },
    ];
  }
  return [
    { label: 'Round Robin', value: 'roundrobin' },
    { label: 'Least Connections', value: 'leastconn' },
    { label: 'Source', value: 'source' },
  ];
};

interface StickinessOption {
  label: string;
  value: Stickiness;
}

export const getStickinessOptions = (
  protocol: Protocol
): StickinessOption[] => {
  if (protocol === 'udp') {
    return [
      { label: 'None', value: 'none' },
      { label: 'Session', value: 'session' },
      { label: 'Source IP', value: 'source_ip' },
    ];
  }
  if (protocol === 'tcp') {
    return [
      { label: 'None', value: 'none' },
      { label: 'Table', value: 'table' },
    ];
  }
  return [
    { label: 'None', value: 'none' },
    { label: 'Table', value: 'table' },
    { label: 'HTTP Cookie', value: 'http_cookie' },
  ];
};

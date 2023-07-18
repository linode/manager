import { clamp, compose, filter, isNil, toString } from 'ramda';

import { defaultNumeric } from 'src/utilities/defaultNumeric';
import { getErrorMap } from 'src/utilities/errorUtils';

import type {
  ExtendedNodeBalancerConfigNode,
  NodeBalancerConfigFields,
  NodeBalancerConfigFieldsWithStatus,
  NodeBalancerConfigNodeFields,
} from './types';
import type { APIError } from '@linode/api-v4';
import type { NodeBalancerConfigNode } from '@linode/api-v4/lib/nodebalancers';

export const clampNumericString = (low: number, hi: number) =>
  compose(toString, clamp(low, hi), (value: number) =>
    defaultNumeric(0, value)
  ) as (value: any) => string;

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
  stickiness: 'table',
});

export const nodeForRequest = (node: NodeBalancerConfigNodeFields) => ({
  address: node.address,
  label: node.label,
  /* Force Node creation and updates to set mode to 'accept' */
  mode: node.mode,
  port: node.port,
  weight: +node.weight!,
});

export const formatAddress = (node: ExtendedNodeBalancerConfigNode) => ({
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
    return filter(
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
        check_passive: config.check_passive /* will be boolean or undefined */,
        check_path: shouldIncludeCheckPath(config)
          ? config.check_path
          : undefined,
        check_timeout: !isNil(config.check_timeout)
          ? +config.check_timeout
          : undefined,
        cipher_suite: config.cipher_suite || undefined,
        id: undefined,
        nodebalancer_id: undefined,
        nodes: config.nodes.map(nodeForRequest),
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
      }
    ) as any;
  }) as NodeBalancerConfigFields[];
};

/* Transform the Node fields in an array of Nodes into valid request data
   Does not modify in-place, returns a deep clone of the Nodes */
export const transformConfigNodesForRequest = (
  nodes: NodeBalancerConfigNode[]
): NodeBalancerConfigNodeFields[] => {
  return nodes.map((node: NodeBalancerConfigNodeFields) =>
    nodeForRequest(node)
  );
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
    ],
    filteredErrors(errors)
  );

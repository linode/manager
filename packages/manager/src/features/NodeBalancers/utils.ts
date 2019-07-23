import { clamp, compose, filter, isNil, toString } from 'ramda';

import { NodeBalancerConfigFields } from 'src/services/nodebalancers';
import defaultNumeric from 'src/utilities/defaultNumeric';

export interface NodeBalancerConfigFieldsWithStatus
  extends NodeBalancerConfigFields {
  modifyStatus?: 'new';
}

export const clampNumericString = (low: number, hi: number) =>
  compose(
    toString,
    clamp(low, hi),
    (value: number) => defaultNumeric(0, value)
  ) as (value: any) => string;

export const createNewNodeBalancerConfigNode = (): Linode.NodeBalancerConfigNodeFields => ({
  label: '',
  address: '',
  port: 80,
  weight: 100,
  mode: 'accept',
  modifyStatus: 'new'
});

export const createNewNodeBalancerConfig = (
  withDefaultPort?: boolean
): NodeBalancerConfigFieldsWithStatus => ({
  algorithm: 'roundrobin',
  check_attempts: 2,
  check_body: undefined,
  check_interval: 5,
  check_passive: true,
  check_path: undefined,
  check_timeout: 3,
  check: 'none',
  cipher_suite: undefined,
  port: withDefaultPort ? 80 : undefined,
  protocol: 'http',
  ssl_cert: undefined,
  ssl_key: undefined,
  stickiness: 'table',
  nodes: [createNewNodeBalancerConfigNode()],
  modifyStatus: 'new'
});

export const nodeForRequest = (node: Linode.NodeBalancerConfigNodeFields) => ({
  label: node.label,
  address: node.address,
  port: node.port,
  weight: +node.weight!,
  /* Force Node creation and updates to set mode to 'accept' */
  mode: node.mode
});

export const formatAddress = (node: Linode.NodeBalancerConfigNode) => ({
  ...node,
  address: `${node.address}:${node.port}`
});

export const parseAddress = (node: Linode.NodeBalancerConfigNode) => {
  const match = /^(192\.168\.\d{1,3}\.\d{1,3}):(\d{1,5})$/.exec(node.address);
  if (match) {
    return {
      ...node,
      address: match![1],
      port: match![2]
    };
  }
  return node;
};

export const parseAddresses = (nodes: Linode.NodeBalancerConfigNode[]) => {
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
      el => el !== undefined,
      {
        check_path: config.check_path || undefined,
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
        algorithm: config.algorithm || undefined,
        stickiness: config.stickiness || undefined,
        check: config.check || undefined,
        check_interval: !isNil(config.check_interval)
          ? +config.check_interval
          : undefined,
        check_timeout: !isNil(config.check_timeout)
          ? +config.check_timeout
          : undefined,
        check_attempts: !isNil(config.check_attempts)
          ? +config.check_attempts
          : undefined,
        port: config.port ? +config.port : undefined,
        check_body: config.check_body || undefined,
        check_passive: config.check_passive /* will be boolean or undefined */,
        cipher_suite: config.cipher_suite || undefined,
        ssl_cert:
          config.ssl_cert === '<REDACTED>'
            ? undefined
            : config.ssl_cert || undefined,
        ssl_key:
          config.ssl_key === '<REDACTED>'
            ? undefined
            : config.ssl_key || undefined,
        nodes: config.nodes.map(nodeForRequest),
        id: undefined,
        nodebalancer_id: undefined,
        nodes_status: undefined,
        ssl_fingerprint: undefined,
        ssl_commonname: undefined
      }
    ) as any;
  }) as NodeBalancerConfigFields[];
};

/* Transform the Node fields in an array of Nodes into valid request data
   Does not modify in-place, returns a deep clone of the Nodes */
export const transformConfigNodesForRequest = (
  nodes: Linode.NodeBalancerConfigNode[]
): Linode.NodeBalancerConfigNodeFields[] => {
  return nodes.map((node: Linode.NodeBalancerConfigNodeFields) =>
    nodeForRequest(node)
  );
};

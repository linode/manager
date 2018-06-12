import {
  init,
  filter,
  isNil,
} from 'ramda';

export interface NodeBalancerConfigFields {
  id?: number;
  algorithm?: 'roundrobin' | 'leastconn' | 'source';
  check_attempts?: number; /** 1..30 */
  check_body?: string;
  check_interval?: number;
  check_passive?: boolean;
  check_path?: string;
  check_timeout?: number; /** 1..30 */
  check?: 'none' | 'connection' | 'http' | 'http_body';
  cipher_suite?: 'recommended' | 'legacy';
  port?: number; /** 1..65535 */
  protocol?: 'http' | 'https' | 'tcp';
  ssl_cert?: string;
  ssl_key?: string;
  stickiness?: 'none' | 'table' | 'http_cookie';
  nodes: Linode.NodeBalancerConfigNode[];
}

export const nodeForRequest = (node: Linode.NodeBalancerConfigNode) => ({
  label: node.label,
  address: node.address,
  weight: +node.weight!,
  /* Force Node creation and updates to set mode to 'accept' */
  mode: 'accept' as Linode.NodeBalancerConfigNodeMode,
});

/* Transform an array of configs into valid request data.
   Does not modify in-place, returns a deep clone of the configs */
export const transformConfigsForRequest =
  (configs: NodeBalancerConfigFields[], stripLastNode?: boolean):
  NodeBalancerConfigFields[] => {
    return configs.map((config: NodeBalancerConfigFields) => {
      return filter(
        /* remove the (key: value) pairs that we set to undefined */
        el => el !== undefined,
        {
          check_path: config.check_path || undefined,
          protocol: (
            /*
             * If the provided protocol is "https" and the cert and key are set
             * to "<REDACTED", don't try to set the protocol, it has already
             * been set to "https".
             */
            config.protocol === 'https'
            && config.ssl_cert === '<REDACTED>'
            && config.ssl_key === '<REDACTED>'
          )
            ? undefined
            : config.protocol || undefined,
          algorithm: config.algorithm || undefined,
          stickiness: config.stickiness || undefined,
          check: config.check || undefined,
          check_interval: !isNil(config.check_interval) ? +config.check_interval : undefined,
          check_timeout: !isNil(config.check_timeout) ? +config.check_timeout : undefined,
          check_attempts: !isNil(config.check_attempts) ? +config.check_attempts : undefined,
          port: config.port ? +config.port : undefined,
          check_body: config.check_body || undefined,
          check_passive: config.check_passive, /* will be boolean or undefined */
          cipher_suite: config.cipher_suite || undefined,
          ssl_cert: config.ssl_cert === '<REDACTED>'
            ? undefined
            : config.ssl_cert || undefined,
          ssl_key: config.ssl_key === '<REDACTED>'
            ? undefined
            : config.ssl_key || undefined,
          /* Don't include the blank "not yet added" node */
          nodes: stripLastNode
            ? init(transformConfigNodesForRequest(config.nodes))
            : transformConfigNodesForRequest(config.nodes),
          id: undefined,
          nodebalancer_id: undefined,
          nodes_status: undefined,
          ssl_fingerprint: undefined,
          ssl_commonname: undefined,
        },
      ) as any;
    }) as NodeBalancerConfigFields[];
  };

/* Transform the Node fields in an array of Nodes into valid request data
   Does not modify in-place, returns a deep clone of the Nodes */
export const transformConfigNodesForRequest = (nodes: Linode.NodeBalancerConfigNode[]):
    Linode.NodeBalancerConfigNode[] => {
  return nodes.map((node: Linode.NodeBalancerConfigNode) => nodeForRequest(node));
};

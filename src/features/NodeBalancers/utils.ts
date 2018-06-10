import { clone } from 'ramda';

export interface NodeBalancerConfigFields {
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
  mode: node.mode,
});

/* filter the Node fields in an array of Configs, for validation as request data */
export const transformConfigNodesForRequest = (configs: NodeBalancerConfigFields[]):
    NodeBalancerConfigFields[] => {
  const configs_ = clone(configs);
  configs_.forEach((config: NodeBalancerConfigFields, idx: number) => {
    configs_[idx].nodes = config.nodes.map(
      (node: Linode.NodeBalancerConfigNode) => nodeForRequest(node),
    );
  });
  return configs_;
};

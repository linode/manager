// NodeBalancerConfigFields is defined in this file to solve
// a circular dependency issue. @todo: we should be consistent
// about where we define these types.

/** DEPRECATED!!!! */
/** DEPRECATED!!!! */
/** DEPRECATED!!!! */
export interface NodeBalancerConfigFields {
  id?: number;
  algorithm?: 'roundrobin' | 'leastconn' | 'source';
  check_attempts?: number /** 1..30 */;
  check_body?: string;
  check_interval?: number;
  check_passive?: boolean;
  check_path?: string;
  check_timeout?: number /** 1..30 */;
  check?: 'none' | 'connection' | 'http' | 'http_body';
  cipher_suite?: 'recommended' | 'legacy';
  port?: number /** 1..65535 */;
  protocol?: 'http' | 'https' | 'tcp';
  ssl_cert?: string;
  ssl_key?: string;
  stickiness?: 'none' | 'table' | 'http_cookie';
  nodes: Linode.NodeBalancerConfigNodeFields[];
}

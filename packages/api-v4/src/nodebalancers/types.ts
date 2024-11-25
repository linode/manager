type TCPAlgorithm = 'roundrobin' | 'leastconn' | 'source';
type UDPAlgorithm = 'roundrobin' | 'leastconn' | 'ring_hash';

export type Algorithm = TCPAlgorithm | UDPAlgorithm;

export type Protocol = 'http' | 'https' | 'tcp' | 'udp';

type TCPStickiness = 'none' | 'table' | 'http_cookie';
type UDPStickiness = 'none' | 'session' | 'source_ip';

export type Stickiness = TCPStickiness | UDPStickiness;

export interface NodeBalancer {
  id: number;
  label: string;
  hostname: string;
  /**
   * The connections per second throttle for TCP and HTTP connections
   */
  client_conn_throttle: number;
  /**
   * The connections per second throttle for UDP sessions
   *
   * @todo optional until UDP is GA
   */
  client_udp_sess_throttle?: number;
  region: string;
  ipv4: string;
  ipv6: null | string;
  created: string;
  updated: string;
  transfer: BalancerTransfer;
  tags: string[];
}

export interface NodeBalancerWithConfigIDs extends NodeBalancer {
  configs: number[];
}

export interface NodeBalancerWithConfigs extends NodeBalancer {
  configs: NodeBalancerConfig[];
}

export interface NodesStatus {
  up: number;
  down: number;
}

export interface BalancerTransfer {
  in: number;
  out: number;
  total: number;
}

/**
 * 'none' is reserved for nodes used in UDP configurations. They don't support different modes.
 */
export type NodeBalancerConfigNodeMode =
  | 'accept'
  | 'reject'
  | 'backup'
  | 'drain'
  | 'none';

export interface NodeBalancerConfig {
  id: number;
  nodebalancer_id: number;
  port: number;
  check_passive: boolean;
  ssl_cert: string;
  nodes_status: NodesStatus;
  protocol: Protocol;
  ssl_commonname: string;
  check_interval: number;
  check_attempts: number;
  check_timeout: number;
  check_body: string;
  check_path: string;
  /**
   * @todo Optional until UDP is GA
   */
  udp_check_port?: number;
  /**
   * @readonly this is returned but not editable
   * @todo Optional until UDP is GA
   */
  udp_session_timeout?: number;
  proxy_protocol: NodeBalancerProxyProtocol;
  check: 'none' | 'connection' | 'http' | 'http_body';
  ssl_key: string;
  stickiness: Stickiness;
  algorithm: Algorithm;
  ssl_fingerprint: string;
  cipher_suite: 'recommended' | 'legacy';
  nodes: NodeBalancerConfigNode[];
}

export type NodeBalancerProxyProtocol = 'none' | 'v1' | 'v2';

export interface NodeBalancerConfigPort {
  configId: number;
  port: number;
}

export interface NodeBalancerStats {
  title: string;
  data: {
    connections: [number, number][];
    traffic: {
      out: [number, number][];
      in: [number, number][];
    };
  };
}

export interface CreateNodeBalancerConfig {
  port?: number;
  /**
   * If `udp` is chosen:
   * - `check_passive` must be `false` or unset
   * - `proxy_protocol` must be `none` or unset
   * - The various SSL related fields like `ssl_cert`, `ssl_key`, `cipher_suite_recommended` should not be set
   */
  protocol?: Protocol;
  /**
   * The algorithm for this configuration.
   *
   * TCP and HTTP support `roundrobin`, `leastconn`, and `source`
   * UDP supports `roundrobin`, `leastconn`, and `ring_hash`
   *
   * @default roundrobin
   */
  algorithm?: Algorithm;
  /**
   * Session stickiness for this configuration.
   *
   * TCP and HTTP support `none`, `table`, and `http_cookie`
   * UDP supports `none`, `session`, and `source_ip`
   *
   * @default `session` for UDP
   * @default `none` for TCP and HTTP
   */
  stickiness?: Stickiness;
  check?: 'none' | 'connection' | 'http' | 'http_body';
  check_interval?: number;
  check_timeout?: number;
  check_attempts?: number;
  check_path?: string;
  check_body?: string;
  check_passive?: boolean;
  /**
   * Must be between 1 and 65535
   * @default 80
   */
  udp_check_port?: number;
  cipher_suite?: 'recommended' | 'legacy';
  ssl_cert?: string;
  ssl_key?: string;
}

export type UpdateNodeBalancerConfig = CreateNodeBalancerConfig;

export interface CreateNodeBalancerConfigNode {
  address: string;
  label: string;
  /**
   * Should not be specified when creating a node used on a UDP configuration
   */
  mode?: NodeBalancerConfigNodeMode;
  weight?: number;
}

export type UpdateNodeBalancerConfigNode = Partial<CreateNodeBalancerConfigNode>;

export interface NodeBalancerConfigNode {
  address: string;
  config_id: number;
  id: number;
  label: string;
  mode: NodeBalancerConfigNodeMode;
  nodebalancer_id: number;
  status: 'unknown' | 'UP' | 'DOWN';
  weight: number;
}

export interface NodeBalancerConfigNodeWithPort extends NodeBalancerConfigNode {
  port?: number;
}

export interface CreateNodeBalancerPayload {
  region?: string;
  label?: string;
  /**
   * The connections per second throttle for TCP and HTTP connections
   *
   * Must be between 0 and 20. Set to 0 to disable throttling.
   */
  client_conn_throttle?: number;
  /**
   * The connections per second throttle for UDP sessions
   *
   * Must be between 0 and 20. Set to 0 to disable throttling.
   */
  client_udp_sess_throttle?: number;
  configs: CreateNodeBalancerConfig[];
  firewall_id?: number;
  tags?: string[];
}

type TCPAlgorithm = 'roundrobin' | 'leastconn' | 'source';
type UDPAlgorithm = 'roundrobin' | 'leastconn' | 'ring_hash';

export type Algorithm = TCPAlgorithm | UDPAlgorithm;

export type Protocol = 'http' | 'https' | 'tcp' | 'udp';

type TCPStickiness = 'none' | 'table' | 'http_cookie';
type UDPStickiness = 'none' | 'session' | 'source_ip';

export type Stickiness = TCPStickiness | UDPStickiness;

type NodeBalancerType = 'common' | 'premium';

export interface LKEClusterInfo {
  label: string;
  id: number;
  url: string;
  type: 'lkecluster';
}

export interface NodeBalancer {
  id: number;
  label: string;
  hostname: string;
  /**
   * Maximum number of new TCP connections that a client (identified by a specific source IP)
   * is allowed to initiate every second.
   */
  client_conn_throttle: number;
  /**
   * Maximum number of new UDP sessions that a client (identified by a specific source IP)
   * is allowed to initiate every second.
   *
   * @todo Remove optionality once UDP support is live
   */
  client_udp_sess_throttle?: number;
  region: string;
  type?: NodeBalancerType;
  /**
   * If the NB is associated with a cluster (active or deleted), return its info
   * If the NB is not associated with a cluster, return null
   */
  lke_cluster?: LKEClusterInfo | null;
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
   * @todo Remove optionality once UDP support is live
   */
  udp_check_port?: number;
  /**
   * @readonly This is returned by the API but *not* editable
   * @todo Remove optionality once UDP support is live
   * @default 16
   */
  udp_session_timeout?: number;
  proxy_protocol: NodeBalancerProxyProtocol;
  check: 'none' | 'connection' | 'http' | 'http_body';
  ssl_key: string;
  stickiness: Stickiness;
  algorithm: Algorithm;
  ssl_fingerprint: string;
  /**
   * Is `none` when protocol is UDP
   */
  cipher_suite: 'recommended' | 'legacy' | 'none';
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
   * @default "none"
   */
  proxy_protocol?: NodeBalancerProxyProtocol;
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
  cipher_suite?: 'recommended' | 'legacy' | 'none';
  ssl_cert?: string;
  ssl_key?: string;
  nodes?: CreateNodeBalancerConfigNode[];
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
  subnet_id?: number;
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
  vpc_config_id?: number | null;
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
   * @default 0
   */
  client_conn_throttle?: number;
  /**
   * The connections per second throttle for UDP sessions
   *
   * Must be between 0 and 20. Set to 0 to disable throttling.
   * @default 0
   */
  client_udp_sess_throttle?: number;
  configs: CreateNodeBalancerConfig[];
  firewall_id?: number;
  tags?: string[];
  vpc?: {
    subnet_id: number;
    ipv4_range: string;
    ipv6_range?: string;
  }[];
}

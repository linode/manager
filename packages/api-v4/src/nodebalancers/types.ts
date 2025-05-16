type TCPAlgorithm = 'leastconn' | 'roundrobin' | 'source';
type UDPAlgorithm = 'leastconn' | 'ring_hash' | 'roundrobin';

export type Algorithm = TCPAlgorithm | UDPAlgorithm;

export type Protocol = 'http' | 'https' | 'tcp' | 'udp';

type TCPStickiness = 'http_cookie' | 'none' | 'table';
type UDPStickiness = 'none' | 'session' | 'source_ip';

export type Stickiness = TCPStickiness | UDPStickiness;

type NodeBalancerType = 'common' | 'premium';

export interface LKEClusterInfo {
  id: number;
  label: string;
  type: 'lkecluster';
  url: string;
}

export interface NodeBalancer {
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
  created: string;
  hostname: string;
  id: number;
  ipv4: string;
  ipv6: null | string;
  label: string;
  /**
   * If the NB is associated with a cluster (active or deleted), return its info
   * If the NB is not associated with a cluster, return null
   */
  lke_cluster: LKEClusterInfo | null;
  region: string;
  tags: string[];
  transfer: BalancerTransfer;
  type: NodeBalancerType;
  updated: string;
}

export interface NodeBalancerWithConfigIDs extends NodeBalancer {
  configs: number[];
}

export interface NodeBalancerWithConfigs extends NodeBalancer {
  configs: NodeBalancerConfig[];
}

export interface NodesStatus {
  down: number;
  up: number;
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
  | 'backup'
  | 'drain'
  | 'none'
  | 'reject';

export interface NodeBalancerConfig {
  algorithm: Algorithm;
  check: 'connection' | 'http' | 'http_body' | 'none';
  check_attempts: number;
  check_body: string;
  check_interval: number;
  check_passive: boolean;
  check_path: string;
  check_timeout: number;
  /**
   * Is `none` when protocol is UDP
   */
  cipher_suite: 'legacy' | 'none' | 'recommended';
  id: number;
  nodebalancer_id: number;
  nodes: NodeBalancerConfigNode[];
  nodes_status: NodesStatus;
  port: number;
  protocol: Protocol;
  proxy_protocol: NodeBalancerProxyProtocol;
  ssl_cert: string;
  ssl_commonname: string;
  ssl_fingerprint: string;
  ssl_key: string;
  stickiness: Stickiness;
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
}

export type NodeBalancerProxyProtocol = 'none' | 'v1' | 'v2';

export interface NodeBalancerConfigPort {
  configId: number;
  port: number;
}

export interface NodeBalancerStats {
  data: {
    connections: [number, number][];
    traffic: {
      in: [number, number][];
      out: [number, number][];
    };
  };
  title: string;
}

export interface NodebalancerVpcConfig {
  id: number;
  ipv4_range: null | string;
  ipv6_range: null | string;
  nodebalancer_id: number;
  subnet_id: number;
  vpc_id: number;
}

export interface CreateNodeBalancerConfig {
  /**
   * The algorithm for this configuration.
   *
   * TCP and HTTP support `roundrobin`, `leastconn`, and `source`
   * UDP supports `roundrobin`, `leastconn`, and `ring_hash`
   *
   * @default roundrobin
   */
  algorithm?: Algorithm;
  check?: 'connection' | 'http' | 'http_body' | 'none';
  check_attempts?: number;
  check_body?: string;
  check_interval?: number;
  check_passive?: boolean;
  check_path?: string;
  check_timeout?: number;
  cipher_suite?: 'legacy' | 'none' | 'recommended';
  nodes?: CreateNodeBalancerConfigNode[];
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
  ssl_cert?: string;
  ssl_key?: string;
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
  /**
   * Must be between 1 and 65535
   * @default 80
   */
  udp_check_port?: number;
}

export type UpdateNodeBalancerConfig = CreateNodeBalancerConfig;

export type RebuildNodeBalancerConfig = CreateNodeBalancerConfig;

export interface CreateNodeBalancerConfigNode {
  address: string;
  label: string;
  /**
   * Should not be specified when creating a node used on a UDP configuration
   */
  mode?: NodeBalancerConfigNodeMode;
  subnet_id?: number;
  weight?: number;
}

export type UpdateNodeBalancerConfigNode =
  Partial<CreateNodeBalancerConfigNode>;

export interface NodeBalancerConfigNode {
  address: string;
  config_id: number;
  id: number;
  label: string;
  mode: NodeBalancerConfigNodeMode;
  nodebalancer_id: number;
  status: 'DOWN' | 'unknown' | 'UP';
  vpc_config_id?: null | number;
  weight: number;
}

export interface NodeBalancerConfigNodeWithPort extends NodeBalancerConfigNode {
  port?: number;
}

export interface CreateNodeBalancerPayload {
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
  label?: string;
  region?: string;
  tags?: string[];
  vpcs?: {
    ipv4_range: string;
    ipv6_range?: string;
    subnet_id: number;
  }[];
}

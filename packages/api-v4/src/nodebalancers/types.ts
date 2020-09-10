export interface NodeBalancer {
  id: number;
  label: string;
  hostname: string;
  client_conn_throttle: number;
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

export type NodeBalancerConfigNodeMode =
  | 'accept'
  | 'reject'
  | 'backup'
  | 'drain';

export interface NodeBalancerConfig {
  id: number;
  nodebalancer_id: number;
  port: number;
  check_passive: boolean;
  ssl_cert: string;
  nodes_status: NodesStatus;
  protocol: 'http' | 'https' | 'tcp';
  ssl_commonname: string;
  check_interval: number;
  check_attempts: number;
  check_timeout: number;
  check_body: string;
  check_path: string;
  proxy_protocol: NodeBalancerProxyProtocol;
  check: 'none' | 'connection' | 'http' | 'http_body';
  ssl_key: string;
  stickiness: 'none' | 'table' | 'http_cookie';
  algorithm: 'roundrobin' | 'leastconn' | 'source';
  ssl_fingerprint: string;
  cipher_suite: 'recommended' | 'legacy';
  nodes: NodeBalancerConfigNode[];
  modifyStatus?: 'new';
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
  protocol?: 'http' | 'https' | 'tcp';
  algorithm?: 'roundrobin' | 'leastconn' | 'source';
  stickiness?: 'none' | 'table' | 'http_cookie';
  check?: 'none' | 'connection' | 'http' | 'http_body';
  check_interval?: number;
  check_timeout?: number;
  check_attempts?: number;
  check_path?: string;
  check_body?: string;
  check_passive?: boolean;
  cipher_suite?: 'recommended' | 'legacy';
  ssl_cert?: string;
  ssl_key?: string;
}

export type UpdateNodeBalancerConfig = CreateNodeBalancerConfig;

export interface CreateNodeBalancerConfigNode {
  address: string;
  label: string;
  mode?: NodeBalancerConfigNodeMode;
  weight?: number;
}

export type UpdateNodeBalancerConfigNode = Partial<
  CreateNodeBalancerConfigNode
>;

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
  client_conn_throttle?: number;
  configs: any;
}

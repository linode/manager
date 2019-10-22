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

export type NodeBalancerConfigNodeMode =
  | 'accept'
  | 'reject'
  | 'backup'
  | 'drain';

export type ConfigNodeStatus = 'unknown' | 'UP' | 'DOWN';

export interface CreateNodeBalancerConfigPayload {
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
  nodes?: CreateNodeBalancerConfigNodePayload[];
}

export interface CreateNodeBalancerConfigNodePayload {
  address: string;
  label: string;
  weight?: number;
  mode?: NodeBalancerConfigNodeMode;
}

export interface CreateNodeBalancerPayload {
  region: string;
  label?: string;
  client_conn_throttle?: number;
  tags?: string[];
  configs?: CreateNodeBalancerConfigPayload[];
}

/* tslint:disable-next-line:no-empty-interface */
export interface UpdateNodeBalancerConfig
  extends CreateNodeBalancerConfigPayload {}

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

export type UpdateNodeBalancerConfigNode = Partial<
  CreateNodeBalancerConfigNodePayload
>;

export interface NodeBalancerConfigNode {
  address: string;
  config_id: number;
  id: number;
  label: string;
  mode: NodeBalancerConfigNodeMode;
  nodebalancer_id: number;
  status: ConfigNodeStatus;
  weight: number;
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

export interface NodeBalancerConfig {
  id: number;
  nodebalancer_id: number;
  port: number;
  check_passive: boolean;
  ssl_cert: string | null;
  nodes_status: NodesStatus;
  protocol: 'http' | 'https' | 'tcp';
  ssl_commonname: string;
  check_interval: number;
  check_attempts: number;
  check_timeout: number;
  check_body: string;
  check_path: string;
  check: 'none' | 'connection' | 'http' | 'http_body';
  ssl_key: string | null;
  stickiness: 'none' | 'table' | 'http_cookie';
  algorithm: 'roundrobin' | 'leastconn' | 'source';
  ssl_fingerprint: string;
  cipher_suite: 'recommended' | 'legacy';
}

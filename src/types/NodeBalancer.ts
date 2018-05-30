namespace Linode {
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
  }

  export interface NodesStatus{
    up: number;
    down: number;
  }

  export interface BalancerTransfer{
    in: number;
    out: number;
    total: number;
  }

  export type NodeBalancerConfigNodeMode = 'accept' | 'deny' | 'drain';

  export interface NodeBalancerConfigNode {
    label: string;
    address: string;
    weight?: number;
    mode?: NodeBalancerConfigNodeMode;
  }

  export interface NodeBalancerConfig{
    id: number;
    nodebalancer_id: number;
    port: number;
    check_passive: boolean;
    ssl_cert: string;
    nodes_status: NodesStatus;
    protocol: string;
    ssl_commonname: string;
    check_interval: number;
    check_attempts: number;
    check_timeout: number;
    check_body: string;
    check_path: string;
    check: string;
    ssl_key: string;
    stickiness: string;
    algorithm: string;
    ssl_fingerprint: string;
    cipher_suite: string;
  }

  export interface ExtendedNodeBalancer extends NodeBalancer{
    up: number;
    down: number;
    ports: number[];
  }
}

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
    config?: NodeBalancerConfig[];
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

  export type NodeBalancerConfigNodeMode = 'accept' | 'reject' | 'drain';

  export interface NodeBalancerConfigNode {
    id?: number;
    label: string;
    address: string;
    port?: string;
    weight?: number;
    mode?: NodeBalancerConfigNodeMode;
    /* for the sake of local operations */
    modifyStatus?: 'new' | 'delete' | 'update';
    errors?: Linode.ApiFieldError[];
  }

  export interface NodeBalancerConfig {
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
    nodes?: NodeBalancerConfigNode[];
    modifyStatus?: 'new';
  }

  export interface ExtendedNodeBalancer extends NodeBalancer{
    up: number;
    down: number;
    ports: number[];
  }

  export interface NodeBalancerStats{
    title: string;
    data: {
      connections: [number, number][];
      traffic: {
        out: [number, number][];
        in: [number, number][];
      }
    };
  }
}

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
    tags: string[];
  }

  export interface NodeBalancerWithConfigIDs extends NodeBalancer {
    configs: number[];
  }

  export interface NodeBalancerWithConfigs extends NodeBalancer {
    configs: Linode.NodeBalancerConfig[];
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

  export type NodeBalancerConfigNodeMode = 'accept' | 'reject' | 'drain';

  export interface NodeBalancerConfigNode {
    id?: number;
    label: string;
    address: string;
    port?: number;
    weight?: number;
    nodebalancer_id?: number;
    config_id?: number;
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
    protocol: 'http' | 'https' | 'tcp';
    ssl_commonname: string;
    check_interval: number;
    check_attempts: number;
    check_timeout: number;
    check_body: string;
    check_path: string;
    check: 'none' | 'connection' | 'http' | 'http_body';
    ssl_key: string;
    stickiness: 'none' | 'table' | 'http_cookie';
    algorithm: 'roundrobin' | 'leastconn' | 'source';
    ssl_fingerprint: string;
    cipher_suite: 'recommended' | 'legacy';
    nodes: NodeBalancerConfigNode[];
    modifyStatus?: 'new';
  }

  export interface ExtendedNodeBalancer extends NodeBalancer {
    up: number;
    down: number;
    ports: number[];
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
}

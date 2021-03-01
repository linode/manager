import {
  NodeBalancer,
  NodeBalancerConfigPort,
  NodeBalancerConfigNodeMode,
  NodeBalancerProxyProtocol,
} from '@linode/api-v4/lib/nodebalancers/types';
import { APIError } from '@linode/api-v4/lib/types';

export interface ExtendedNodeBalancerConfigNode {
  id: number;
  label: string;
  address: string;
  port?: number;
  weight?: number;
  nodebalancer_id: number;
  config_id?: number;
  mode?: NodeBalancerConfigNodeMode;
  modifyStatus?: 'new' | 'delete' | 'update';
  errors?: APIError[];
  status: 'UP' | 'DOWN' | 'unknown';
}

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
  proxy_protocol?: NodeBalancerProxyProtocol;
  ssl_cert?: string;
  ssl_key?: string;
  stickiness?: 'none' | 'table' | 'http_cookie';
  nodes: NodeBalancerConfigNodeFields[];
}

export interface NodeBalancerConfigNodeFields {
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
  errors?: APIError[];
  status?: 'UP' | 'DOWN' | 'unknown';
}
export interface ExtendedNodeBalancer extends NodeBalancer {
  up: number;
  down: number;
  configPorts: NodeBalancerConfigPort[];
}

import {
  NodeBalancerConfigNodeMode,
  NodeBalancerProxyProtocol,
} from '@linode/api-v4/lib/nodebalancers/types';
import { APIError } from '@linode/api-v4/lib/types';

export interface NodeBalancerConfigFieldsWithStatus
  extends NodeBalancerConfigFields {
  modifyStatus?: 'new';
}
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

export interface NodeBalancerConfigPanelProps {
  nodeBalancerRegion?: string;
  errors?: APIError[];
  nodeMessage?: string;
  configIdx?: number;

  forEdit?: boolean;
  submitting?: boolean;
  onSave?: () => void;
  onDelete?: any;

  algorithm: 'roundrobin' | 'leastconn' | 'source';
  onAlgorithmChange: (v: string) => void;

  checkPassive: boolean;
  onCheckPassiveChange: (v: boolean) => void;

  checkBody: string;
  onCheckBodyChange: (v: string) => void;

  checkPath: string;
  onCheckPathChange: (v: string) => void;

  port: number;
  onPortChange: (v: string | number) => void;

  protocol: 'http' | 'https' | 'tcp';
  onProtocolChange: (v: string) => void;

  proxyProtocol: NodeBalancerProxyProtocol;
  onProxyProtocolChange: (v: string) => void;

  healthCheckType: 'none' | 'connection' | 'http' | 'http_body';
  onHealthCheckTypeChange: (v: string) => void;

  healthCheckAttempts: number;
  onHealthCheckAttemptsChange: (v: string | number) => void;

  healthCheckInterval: number;
  onHealthCheckIntervalChange: (v: string | number) => void;

  healthCheckTimeout: number;
  onHealthCheckTimeoutChange: (v: string | number) => void;

  sessionStickiness: 'none' | 'table' | 'http_cookie';
  onSessionStickinessChange: (v: string) => void;

  sslCertificate: string;
  onSslCertificateChange: (v: string) => void;

  privateKey: string;
  onPrivateKeyChange: (v: string) => void;

  nodes: NodeBalancerConfigNodeFields[];
  disabled?: boolean;
  addNode: (nodeIdx?: number) => void;
  removeNode: (nodeIdx: number) => void;
  onNodeLabelChange: (nodeIdx: number, value: string) => void;
  onNodeAddressChange: (nodeIdx: number, value: string) => void;
  onNodePortChange: (nodeIdx: number, value: string) => void;
  onNodeWeightChange: (nodeIdx: number, value: string) => void;
  onNodeModeChange?: (nodeIdx: number, value: string) => void;
}

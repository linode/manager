import type {
  APIError,
  Algorithm,
  NodeBalancerConfigNodeMode,
  NodeBalancerProxyProtocol,
  Protocol,
  Stickiness,
} from '@linode/api-v4';

export interface NodeBalancerConfigFieldsWithStatus
  extends NodeBalancerConfigFields {
  modifyStatus?: 'new';
}

export interface ExtendedNodeBalancerConfigNode {
  address: string;
  config_id?: number;
  errors?: APIError[];
  id: number;
  label: string;
  mode?: NodeBalancerConfigNodeMode;
  modifyStatus?: 'delete' | 'new' | 'update';
  nodebalancer_id: number;
  port?: number;
  status: 'DOWN' | 'UP' | 'unknown';
  weight?: number;
}

export interface NodeBalancerConfigFields {
  algorithm?: Algorithm;
  check?: 'connection' | 'http' | 'http_body' | 'none';
  check_attempts?: number /** 1..30 */;
  check_body?: string;
  check_interval?: number;
  check_passive?: boolean;
  check_path?: string;
  check_timeout?: number /** 1..30 */;
  cipher_suite?: 'legacy' | 'recommended';
  id?: number;
  nodes: NodeBalancerConfigNodeFields[];
  port?: number /** 1..65535 */;
  protocol?: Protocol;
  proxy_protocol?: NodeBalancerProxyProtocol;
  ssl_cert?: string;
  ssl_key?: string;
  stickiness?: Stickiness;
}

export interface NodeBalancerConfigNodeFields {
  address: string;
  config_id?: number;
  errors?: APIError[];
  id?: number;
  label: string;
  mode?: NodeBalancerConfigNodeMode;
  /* for the sake of local operations */
  modifyStatus?: 'delete' | 'new' | 'update';
  nodebalancer_id?: number;
  port?: number;
  status?: 'DOWN' | 'UP' | 'unknown';
  weight?: number;
}

export interface NodeBalancerConfigPanelProps {
  addNode: (nodeIdx?: number) => void;
  algorithm: Algorithm;
  checkBody: string;
  checkPassive: boolean;

  checkPath: string;
  configIdx?: number;
  disabled?: boolean;
  errors?: APIError[];

  forEdit?: boolean;
  healthCheckAttempts: number;

  healthCheckInterval: number;
  healthCheckTimeout: number;

  healthCheckType: 'connection' | 'http' | 'http_body' | 'none';
  nodeBalancerRegion?: string;

  nodeMessage?: string;
  nodes: NodeBalancerConfigNodeFields[];

  onAlgorithmChange: (v: string) => void;
  onCheckBodyChange: (v: string) => void;

  onCheckPassiveChange: (v: boolean) => void;
  onCheckPathChange: (v: string) => void;

  onDelete?: any;
  onHealthCheckAttemptsChange: (v: number | string) => void;

  onHealthCheckIntervalChange: (v: number | string) => void;
  onHealthCheckTimeoutChange: (v: number | string) => void;

  onHealthCheckTypeChange: (v: string) => void;
  onNodeAddressChange: (nodeIdx: number, value: string) => void;

  onNodeLabelChange: (nodeIdx: number, value: string) => void;
  onNodeModeChange?: (nodeIdx: number, value: string) => void;

  onNodePortChange: (nodeIdx: number, value: string) => void;
  onNodeWeightChange: (nodeIdx: number, value: string) => void;

  onPortChange: (v: number | string) => void;
  onPrivateKeyChange: (v: string) => void;

  onProtocolChange: (v: string) => void;
  onProxyProtocolChange: (v: string) => void;

  onSave?: () => void;
  onSessionStickinessChange: (v: string) => void;

  onSslCertificateChange: (v: string) => void;
  port: number;
  privateKey: string;
  protocol: Protocol;
  proxyProtocol: NodeBalancerProxyProtocol;
  removeNode: (nodeIdx: number) => void;
  sessionStickiness: Stickiness;
  sslCertificate: string;
  submitting?: boolean;
}

import type {
  APIError,
  Algorithm,
  NodeBalancerConfigNode,
  NodeBalancerProxyProtocol,
  Protocol,
  Stickiness,
  UpdateNodeBalancerConfig,
} from '@linode/api-v4';

export interface NodeBalancerConfigFieldsWithStatus
  extends NodeBalancerConfigFields {
  /**
   * Exists for the sake of local operations
   */
  modifyStatus?: 'new';
}

export interface NodeBalancerConfigFields extends UpdateNodeBalancerConfig {
  id?: number;
  nodes: NodeBalancerConfigNodeFields[];
}

export interface NodeBalancerConfigNodeFields
  extends Partial<NodeBalancerConfigNode> {
  address: string;
  errors?: APIError[];
  label: string;
  /**
   * Exists for the sake of local operations
   */
  modifyStatus?: 'delete' | 'new' | 'update';
  /**
   * @note `port` is an "extended" field. The API includes it in the `address`
   */
  port?: number;
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

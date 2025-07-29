import type { EncryptionStatus } from '../linodes';

export type KubernetesTier = 'enterprise' | 'standard';

export type KubernetesTaintEffect =
  | 'NoExecute'
  | 'NoSchedule'
  | 'PreferNoSchedule';

export type Label = {
  [key: string]: string;
};

export type NodePoolUpdateStrategy = 'on_recycle' | 'rolling_update';

export type KubernetesStackType = 'ipv4' | 'ipv4-ipv6';

export interface Taint {
  effect: KubernetesTaintEffect;
  key: string;
  value: string | undefined;
}

export interface KubernetesCluster {
  apl_enabled?: boolean; // this is not the ideal solution, but a necessary compromise to prevent a lot of duplicated code.
  control_plane: ControlPlaneOptions;
  created: string;
  id: number;
  k8s_version: string;
  label: string;
  region: string;
  /**
   * Upcoming Feature Notice - LKE-E:** this property may not be available to all customers
   * and may change in subsequent releases.
   */
  stack_type?: KubernetesStackType;
  status: string; // @todo enum this
  /**
   * Upcoming Feature Notice - LKE-E:** this property may not be available to all customers
   * and may change in subsequent releases.
   */
  subnet_id?: number;
  tags: string[];
  /** Marked as 'optional' in this existing interface to prevent duplicated code for beta functionality, in line with the apl_enabled approach.
   * @todo LKE-E - Make this field required once LKE-E is in GA. tier defaults to 'standard' in the API.
   */
  tier?: KubernetesTier;
  updated: string;
  /**
   * Upcoming Feature Notice - LKE-E:** this property may not be available to all customers
   * and may change in subsequent releases.
   */
  vpc_id?: number;
}

export interface KubeNodePoolResponse {
  autoscaler: AutoscaleSettings;
  count: number;
  disk_encryption?: EncryptionStatus; // @TODO LDE: remove optionality once LDE is fully rolled out
  id: number;
  labels: Label;
  nodes: PoolNodeResponse[];
  tags: string[];
  taints: Taint[];
  type: string;
}

export interface KubeNodePoolResponseBeta extends KubeNodePoolResponse {
  firewall_id: number;
  k8s_version: string;
  update_strategy: NodePoolUpdateStrategy;
}

export interface PoolNodeResponse {
  id: string;
  instance_id: null | number;
  status: string;
}

export interface CreateNodePoolData {
  count: number;
  type: string;
}

export interface CreateNodePoolDataBeta extends CreateNodePoolData {
  firewall_id?: number;
  k8s_version?: string;
  update_strategy?: NodePoolUpdateStrategy;
}

export interface UpdateNodePoolData {
  autoscaler: AutoscaleSettings;
  count: number;
  labels: Label;
  tags: string[];
  taints: Taint[];
}

export interface UpdateNodePoolDataBeta extends UpdateNodePoolData {
  firewall_id?: number;
  k8s_version?: string;
  update_strategy?: NodePoolUpdateStrategy;
}

export interface AutoscaleSettings {
  enabled: boolean;
  max: number;
  min: number;
}

export interface KubeConfigResponse {
  kubeconfig: string;
}

export interface KubernetesVersion {
  id: string;
}

export interface KubernetesTieredVersion {
  id: string;
  tier: KubernetesTier;
}

export interface KubernetesEndpointResponse {
  endpoint: string;
}

export interface KubernetesDashboardResponse {
  url: string;
}

export interface KubernetesControlPlaneACLPayload {
  acl: ControlPlaneACLOptions;
}

export interface ControlPlaneACLOptions {
  addresses?: null | {
    ipv4?: null | string[];
    ipv6?: null | string[];
  };
  enabled?: boolean;
  'revision-id'?: string;
}

export interface ControlPlaneOptions {
  acl?: ControlPlaneACLOptions;
  high_availability?: boolean;
}

export interface CreateKubeClusterPayload {
  apl_enabled?: boolean; // this is not the ideal solution, but a necessary compromise to prevent a lot of duplicated code.
  control_plane?: ControlPlaneOptions;
  k8s_version?: string; // Will be caught by Yup if undefined
  label?: string; // Label will be assigned by the API if not provided
  node_pools: CreateNodePoolDataBeta[];
  region?: string; // Will be caught by Yup if undefined
  stack_type?: KubernetesStackType; // For LKE-E; will default to 'ipv4'
  tier?: KubernetesTier; // For LKE-E: Will be assigned 'standard' by the API if not provided
}

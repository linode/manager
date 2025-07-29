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
  disk_encryption: EncryptionStatus;
  /**
   * The ID of the Firewall applied to all Nodes in the pool.
   *
   * @note Only returned for LKE Enterprise clusters
   */
  firewall_id?: number;
  id: number;
  /**
   * The LKE version of the Node Pool.
   *
   * @note Only returned for LKE Enterprise clusters
   */
  k8s_version?: string;
  labels: Label;
  nodes: PoolNodeResponse[];
  tags: string[];
  taints: Taint[];
  type: string;
  /**
   * Determines when the worker nodes within this node pool upgrade to the latest selected
   * Kubernetes version, after the cluster has been upgraded.
   *
   * @note Only returned for LKE Enterprise clusters
   */
  update_strategy?: NodePoolUpdateStrategy;
}

export interface PoolNodeResponse {
  id: string;
  instance_id: null | number;
  status: string;
}

export interface CreateNodePoolData {
  /**
   * When enabled, the number of nodes automatically scales within the defined minimum and maximum values.
   */
  autoscaler?: AutoscaleSettings;
  /**
   * The number of nodes that should exist in the pool.
   */
  count: number;
  /**
   * The ID of a Firewall to apply to all nodes in the pool.
   *
   * @note Only supported on LKE Enterprise clusters
   */
  firewall_id?: number;
  /**
   * The LKE version that the node pool should use.
   *
   * @note Only supported on LKE Enterprise clusters
   * @note This field may be required when creating a Node Pool on a LKE Enterprise cluster
   */
  k8s_version?: string;
  /**
   * Key-value pairs added as labels to nodes in the node pool.
   */
  labels?: Label;
  tags?: string[];
  /**
   * Kubernetes taints to add to node pool nodes.
   */
  taints?: Taint[];
  /**
   * The Linode Type for all of the nodes in the Node Pool.
   */
  type: string;
  /**
   * Determines when the worker nodes within this node pool upgrade to the latest selected
   * Kubernetes version, after the cluster has been upgraded.
   *
   * @note Only supported on LKE Enterprise clusters
   * @default on_recycle
   */
  update_strategy?: NodePoolUpdateStrategy;
}

export type UpdateNodePoolData = Partial<CreateNodePoolData>;

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
  node_pools: CreateNodePoolData[];
  region?: string; // Will be caught by Yup if undefined
  tier?: KubernetesTier; // For LKE-E: Will be assigned 'standard' by the API if not provided
}

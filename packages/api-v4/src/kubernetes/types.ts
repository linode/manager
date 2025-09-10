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
  subnet_id?: null | number;
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
  vpc_id?: null | number;
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
  /**
   * A label/name for the Node Pool
   *
   * @default ""
   */
  label: string;
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
   * An optional label/name for the Node Pool.
   *
   * @default ""
   */
  label?: string;
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
  /**
   * Upcoming Feature, Beta - Delivery logs
   */
  audit_logs_enabled?: boolean;
  high_availability?: boolean;
}

export interface CreateKubeClusterPayload {
  /**
   * Whether the Akamai App Platform is installed during creation of the LKE cluster.
   * @default false
   */
  apl_enabled?: boolean;
  /**
   * Defines settings for the Kubernetes control plane, including High Availability (HA) and an IP-based Access Control List (ACL).
   */
  control_plane?: ControlPlaneOptions;
  /**
   * The desired Kubernetes version for this Kubernetes cluster in the format of <major>.<minor>.
   * @note Caught by Yup if undefined.
   */
  k8s_version?: string; // Will be caught by Yup if undefined
  /**
   * The cluster's unique label for display purposes only.
   * @note Will be assigned by the API if not provided.
   */
  label?: string;
  /**
   * Node pools in the cluster.
   */
  node_pools: CreateNodePoolData[];
  /**
   * The cluster's location.
   * @note Will be caught by Yup if undefined.
   */
  region?: string;
  /**
   * The networking for the LKE-E cluster (single or dual stack).
   *
   * @note Upcoming Feature Notice - LKE-E:** this property may not be available to all customers
   * and may change in subsequent releases.
   * @default for LKE-E: 'ipv4'
   */
  stack_type?: KubernetesStackType;
  /**
   * The id of the specified VPC subnet associated with the LKE-E cluster.
   *
   * @note Upcoming Feature Notice - LKE-E:** this property may not be available to all customers
   * and may change in subsequent releases.
   */
  subnet_id?: number;
  /**
   * The desired Kubernetes tier.
   *
   * @note Upcoming Feature Notice - LKE-E:** this property may not be available to all customers
   * and may change in subsequent releases.
   * @default standard
   */
  tier?: KubernetesTier;
  /**
   * The id of the specified VPC associated with the LKE-E cluster.
   *
   * @note Upcoming Feature Notice - LKE-E:** this property may not be available to all customers
   * and may change in subsequent releases.
   */
  vpc_id?: number;
}

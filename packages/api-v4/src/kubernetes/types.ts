import type { EncryptionStatus } from '../linodes';

export interface KubernetesCluster {
  created: string;
  updated: string;
  region: string;
  status: string; // @todo enum this
  label: string;
  k8s_version: string;
  id: number;
  tags: string[];
  control_plane: ControlPlaneOptions;
  apl_enabled?: boolean; // this is not the ideal solution, but a necessary compromise to prevent a lot of duplicated code.
}

export interface KubeNodePoolResponse {
  count: number;
  id: number;
  nodes: PoolNodeResponse[];
  type: string;
  autoscaler: AutoscaleSettings;
  disk_encryption?: EncryptionStatus; // @TODO LDE: remove optionality once LDE is fully rolled out
}

export interface PoolNodeResponse {
  id: string;
  instance_id: number | null;
  status: string;
}

export interface CreateNodePoolData {
  type: string;
  count: number;
}

export interface UpdateNodePoolData {
  autoscaler: AutoscaleSettings;
  count: number;
}

export interface AutoscaleSettings {
  enabled: boolean;
  min: number;
  max: number;
}

export interface KubeConfigResponse {
  kubeconfig: string;
}

export interface KubernetesVersion {
  id: string;
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
  enabled?: boolean;
  'revision-id'?: string;
  addresses?: null | {
    ipv4?: null | string[];
    ipv6?: null | string[];
  };
}

export interface ControlPlaneOptions {
  high_availability?: boolean;
  acl?: ControlPlaneACLOptions;
}

export interface CreateKubeClusterPayload {
  label?: string; // Label will be assigned by the API if not provided
  region?: string; // Will be caught by Yup if undefined
  node_pools: CreateNodePoolData[];
  k8s_version?: string; // Will be caught by Yup if undefined
  control_plane?: ControlPlaneOptions;
  apl_enabled?: boolean; // this is not the ideal solution, but a necessary compromise to prevent a lot of duplicated code.
}
